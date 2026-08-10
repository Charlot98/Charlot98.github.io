import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  readlink,
  realpath,
  rename,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = path.join(ROOT, 'publish-manifest.json');
const SITE_DIR = path.join(ROOT, '.site');
const TEMP_DIR = path.join(ROOT, '.site.tmp');
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const TEXT_EXTENSIONS = new Set([
  '.css', '.csv', '.html', '.js', '.json', '.map', '.md', '.mjs',
  '.svg', '.txt', '.webmanifest', '.xml', '.yml', '.yaml',
]);
const SKIPPED_NAMES = new Set([
  '.DS_Store', '.git', '.gitignore', '.svn', 'Thumbs.db',
  'config.local.js', 'desktop.ini',
]);
const FORBIDDEN_DATA_EXTENSIONS = new Set([
  '.db', '.sqlite', '.sqlite3', '.p12', '.pfx', '.pem', '.key',
]);
const SECRET_PATTERNS = [
  ['private key', /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/],
  ['provider API key', /\bsk-[A-Za-z0-9_-]{16,}\b/],
  ['hard-coded API credential', /\b(?:apiKey|apiSecret|accessKeyId)\s*:\s*['"`][^'"`\s]{8,}['"`]/i],
  ['Supabase service role value', /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*['"`][^'"`\s]{8,}['"`]/i],
];

function fail(message) {
  throw new Error(message);
}

function safeRelative(value, label) {
  if (!value || path.isAbsolute(value)) fail(`${label} 必须是相对路径`);
  const normalized = path.normalize(value);
  if (normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
    fail(`${label} 不能离开仓库根目录`);
  }
  return normalized;
}

function shouldSkip(name) {
  return SKIPPED_NAMES.has(name) || name === '.env' || name.startsWith('.env.');
}

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

async function directoryHasFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (shouldSkip(entry.name)) continue;
    if (entry.isDirectory()) {
      if (await directoryHasFiles(path.join(directory, entry.name))) return true;
    } else {
      return true;
    }
  }
  return false;
}

async function assertSourceSafe(sourceRoot, current = sourceRoot) {
  const entries = await readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(current, entry.name);
    if (shouldSkip(entry.name)) continue;

    if (entry.isDirectory()) {
      if (entry.name.toLowerCase() === 'db' && await directoryHasFiles(sourcePath)) {
        fail(`检测到数据库目录，拒绝发布：${path.relative(ROOT, sourcePath)}`);
      }
      await assertSourceSafe(sourceRoot, sourcePath);
      continue;
    }

    if (entry.isSymbolicLink()) {
      const target = await readlink(sourcePath);
      if (path.isAbsolute(target)) {
        fail(`检测到绝对符号链接，拒绝发布：${path.relative(ROOT, sourcePath)}`);
      }
      const resolved = await realpath(sourcePath);
      if (!resolved.startsWith(`${sourceRoot}${path.sep}`)) {
        fail(`符号链接离开版本目录，拒绝发布：${path.relative(ROOT, sourcePath)}`);
      }
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (FORBIDDEN_DATA_EXTENSIONS.has(extension)) {
      fail(`检测到数据库或密钥文件，拒绝发布：${path.relative(ROOT, sourcePath)}`);
    }
  }
}

async function copyTree(sourceRoot, destinationRoot, current = sourceRoot) {
  await mkdir(destinationRoot, { recursive: true });
  const entries = await readdir(current, { withFileTypes: true });

  for (const entry of entries) {
    if (shouldSkip(entry.name) || entry.name.toLowerCase() === 'db') continue;

    const sourcePath = path.join(current, entry.name);
    const relative = path.relative(sourceRoot, sourcePath);
    const destinationPath = path.join(destinationRoot, relative);

    if (entry.isDirectory()) {
      await mkdir(destinationPath, { recursive: true });
      await copyTree(sourceRoot, destinationRoot, sourcePath);
      continue;
    }

    if (entry.isSymbolicLink()) {
      const target = await readlink(sourcePath);
      await mkdir(path.dirname(destinationPath), { recursive: true });
      await symlink(target, destinationPath);
      continue;
    }

    const metadata = await stat(sourcePath);
    if (metadata.size > MAX_FILE_SIZE) {
      fail(`文件超过 GitHub 100 MB 限制：${path.relative(ROOT, sourcePath)}`);
    }
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
  }
}

async function transformAndAudit(directory, replacements = []) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await transformAndAudit(filePath, replacements);
      continue;
    }
    if (entry.isSymbolicLink()) continue;

    const metadata = await stat(filePath);
    if (metadata.size > MAX_FILE_SIZE) {
      fail(`生成文件超过 GitHub 100 MB 限制：${path.relative(TEMP_DIR, filePath)}`);
    }
    if (!isTextFile(filePath)) continue;

    let content = await readFile(filePath, 'utf8');
    for (const replacement of replacements) {
      if (!replacement.from) fail('replacements.from 不能为空');
      content = content.split(replacement.from).join(replacement.to || '');
    }
    for (const [label, pattern] of SECRET_PATTERNS) {
      if (pattern.test(content)) {
        fail(`检测到${label}，拒绝发布：${path.relative(TEMP_DIR, filePath)}`);
      }
    }
    await writeFile(filePath, content);
  }
}

function aliasPage(target) {
  const escaped = JSON.stringify(target);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=${target}">
  <link rel="canonical" href="${target}">
  <title>正在跳转</title>
</head>
<body>
  <p>页面已迁移，正在跳转到 <a href="${target}">${target}</a>。</p>
  <script>location.replace(${escaped} + location.search + location.hash);</script>
</body>
</html>
`;
}

async function loadManifest() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.projects)) {
    fail('publish-manifest.json 格式无效');
  }
  return manifest;
}

async function main() {
  const manifest = await loadManifest();
  await rm(TEMP_DIR, { recursive: true, force: true });
  await mkdir(TEMP_DIR, { recursive: true });

  const portalSource = path.join(ROOT, safeRelative(manifest.portal?.source, 'portal.source'));
  await copyFile(portalSource, path.join(TEMP_DIR, 'index.html'));
  if (manifest.portal?.notFoundSource) {
    const notFoundSource = path.join(
      ROOT,
      safeRelative(manifest.portal.notFoundSource, 'portal.notFoundSource'),
    );
    await copyFile(notFoundSource, path.join(TEMP_DIR, '404.html'));
  }
  for (const asset of manifest.portal?.assets || []) {
    const relative = safeRelative(asset, 'portal.assets');
    const source = path.join(ROOT, relative);
    const destination = path.join(TEMP_DIR, relative);
    const metadata = await lstat(source).catch(() => null);
    if (!metadata?.isFile()) fail(`门户资源不存在：${relative}`);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }

  const publishedVersions = {};
  for (const project of manifest.projects) {
    if (!project.id || !project.destination) fail('项目 id 和 destination 不能为空');
    if (!project.enabled) {
      console.log(`跳过 ${project.id}: ${project.reason || '未启用'}`);
      continue;
    }

    const source = path.join(ROOT, safeRelative(project.source, `${project.id}.source`));
    const destination = path.join(
      TEMP_DIR,
      safeRelative(project.destination, `${project.id}.destination`),
    );
    const sourceMetadata = await lstat(source).catch(() => null);
    if (!sourceMetadata?.isDirectory()) {
      fail(`版本目录不存在：${project.source}`);
    }

    const sourceRoot = await realpath(source);
    await assertSourceSafe(sourceRoot);
    await copyTree(sourceRoot, destination);
    await transformAndAudit(destination, project.replacements || []);

    const entry = path.join(destination, safeRelative(project.entry, `${project.id}.entry`));
    const entryMetadata = await lstat(entry).catch(() => null);
    if (!entryMetadata?.isFile()) {
      fail(`${project.id} 缺少入口文件：${project.entry}`);
    }
    publishedVersions[project.id] = project.version;
    console.log(`发布 ${project.id}: ${project.version} -> /${project.destination}/`);
  }

  for (const alias of manifest.aliases || []) {
    const aliasDirectory = path.join(TEMP_DIR, safeRelative(alias.from, 'alias.from'));
    await mkdir(aliasDirectory, { recursive: true });
    await writeFile(path.join(aliasDirectory, 'index.html'), aliasPage(alias.to));
  }

  await writeFile(path.join(TEMP_DIR, '.nojekyll'), '');
  await writeFile(
    path.join(TEMP_DIR, 'versions.json'),
    `${JSON.stringify({ projects: publishedVersions }, null, 2)}\n`,
  );
  await transformAndAudit(TEMP_DIR, [
    { from: '/my_docs/', to: '/my-docs/' },
    { from: '/vetvault_changelog/', to: '/vetvault-changelog/' },
  ]);

  await rm(SITE_DIR, { recursive: true, force: true });
  await rename(TEMP_DIR, SITE_DIR);
  console.log(`完成：${path.relative(ROOT, SITE_DIR)}/ 已重建`);
}

main().catch(async (error) => {
  await rm(TEMP_DIR, { recursive: true, force: true });
  console.error(`发布同步失败：${error.message}`);
  process.exitCode = 1;
});
