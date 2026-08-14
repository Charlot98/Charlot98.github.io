# VetVault GitHub Pages 发布

本仓库只同步 GitHub Pages 发布控制文件与 `.site/` 最新版本快照。项目源码、历史版本、业务数据、模型和本地配置不会上传。

## 更新版本

1. 将静态版本放入对应项目的 `pub/版本号/`。
2. 在 `publish-manifest.json` 中修改该项目的 `version` 与 `source`。
3. 双击 `publish.command`，检查差异后确认提交和推送。

发布脚本会重建 `.site/`，并拒绝数据库、密钥文件、硬编码 API 凭据、绝对符号链接和超过 100 MB 的文件。

## 固定网址

- `/dentalchart/`
- `/charts/`
- `/vetvault-changelog/`
- `/echocardiography/`
- `/my-docs/`
- `/queue_demo/`

旧源码仓库占用了 GitHub 的 `/changelog/` 路由，因此更新日志使用 `/vetvault-changelog/`。AudioReports 在接入服务端安全代理前暂停公开发布。

## 本地备份

切换为公开 Pages 仓库前的私有 Git 历史、元数据和未提交差异保存在仓库外：

`/Users/charlot98/coding/vetvault-backups/2026-08-10-pages-reset/`
