# Vet Vault
- [心超报告生成器](echocardiography/echocardiography.html)
- [更新日志](https://charlot98.github.io/vetvault_changelog/)
- [知识库](https://charlot98.github.io/my_docs/)
- [统计看板](https://charlot98.github.io/charts/dashboard.html)
- [牙表](https://charlot98.github.io/dentalchart/dental_chart_pub.html)

<<<<<<< HEAD
- [统计看板](https://charlot98.github.io/charts/dashboard.html)

- [牙表](https://charlot98.github.io/dentalchart/dental_chart_pub.html)
=======
---

## dev 分支与项目预览

### 分支说明

- **main**：生产环境，推送后自动更新 charlot98.github.io
- **dev**：开发分支，用于功能开发与预览

### 创建 / 切换 dev 分支

```bash
# 创建 dev 分支（若尚未创建）
git checkout -b dev

# 推送到远程并设置上游
git push -u origin dev

# 日常开发：切换到 dev
git checkout dev
```

### 预览方式

#### 1. 快速本地预览

在项目根目录执行：

```bash
# 确保在 dev 分支
git checkout dev

# 推荐：使用内置预览服务器（支持 my_docs 等 SPA 子路径刷新）
node preview-server.js
# 访问 http://127.0.0.1:5500

# 或使用其他服务（my_docs 子路径刷新会 404）
npx serve . -p 3000
# 或
python3 -m http.server 8000
```

**注意**：知识库 my_docs 为 SPA。若用 **VS Code Live Server（5500 端口）**，子路径刷新会 404，请改用本项目的 `node preview-server.js` 启动（同样 5500 端口）；或直接访问带尾部斜杠的地址：`/my_docs/getting-started/structure/`。

#### 2. GitHub Actions 在线预览

推送代码到 dev 分支后，GitHub Actions 会自动部署到 Surge 生成预览链接。

**首次配置**（需完成一次）：

1. 注册 [Surge.sh](https://surge.sh/)（免费）
2. 安装 Surge：`npm install -g surge`
3. 登录并获取 token：`surge login` → `surge token`
4. 在 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions** 中新增 Secret：
   - 名称：`SURGE_TOKEN`
   - 值：上一步获得的 token

配置完成后，每次 push 到 dev 分支，预览地址为：**https://vetvault-dev.surge.sh**

### 更新到 origin/main

将 dev 的改动合并到 main 并推送到远程：

**方式一：本地合并后推送**

```bash
# 1. 确保 dev 的改动已提交并推送
git checkout dev
git add .
git commit -m "你的提交说明"
git push origin dev

# 2. 切换到 main 并合并 dev
git checkout main
git merge dev

# 3. 推送到 origin/main
git push origin main
```

**方式二：GitHub Pull Request（推荐）**

1. 在 GitHub 仓库页面发起 Pull Request：`dev` → `main`
2. 审查、合并
3. 本地同步：`git checkout main && git pull origin main`

**方式三：在 main 上直接修改并推送**

```bash
git checkout main
# 修改文件...
git add .
git commit -m "提交说明"
git push origin main
```

## 访问说明

- **推荐入口**：根路径 `/` 提供导航页，所有链接使用相对路径，适配 GitHub Pages、Vercel、本地预览
- 若 charlot98.github.io 发生重定向，可直接访问子路径（如 `/my_docs/`、`/charts/dashboard.html`）或使用 Vercel 域名
>>>>>>> ae9d838 (feat: add queue system for patient display with screens 1 and 2)
