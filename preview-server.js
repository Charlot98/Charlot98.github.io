#!/usr/bin/env node
/**
 * 本地预览服务器 - 支持 my_docs 等 SPA 子路径刷新
 * 用法: node preview-server.js 或 npx node preview-server.js
 * 访问: http://localhost:5500
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.md': 'text/markdown',
};

const SPA_FALLBACKS = [
  /^\/my_docs(\/|$)/,
  /^\/vetvault_changelog(\/|$)/,
];

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

function getSpaFallback(urlPath) {
  if (urlPath.startsWith('/my_docs')) return path.join(ROOT, 'my_docs', '200.html');
  if (urlPath.startsWith('/vetvault_changelog')) return path.join(ROOT, 'vetvault_changelog', '200.html');
  return null;
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(new URL(req.url, 'http://localhost/').pathname);
  if (urlPath.endsWith('/') && urlPath.length > 1) urlPath += 'index.html';
  const normalizedPath = urlPath.replace(/^\//, '') || '';
  let filePath = path.join(ROOT, normalizedPath);

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      serveFile(filePath, res);
      return;
    }
    const fallback = getSpaFallback(urlPath);
    if (fallback && fs.existsSync(fallback)) {
      serveFile(fallback, res);
      return;
    }
    const withHtml = filePath + '.html';
    if (fs.existsSync(withHtml)) {
      serveFile(withHtml, res);
      return;
    }
    res.writeHead(404);
    res.end('Not Found');
  });
});

server.listen(PORT, () => {
  console.log(`Preview server: http://127.0.0.1:${PORT}`);
  console.log('my_docs SPA 支持刷新 /my_docs/* 子路径');
});
