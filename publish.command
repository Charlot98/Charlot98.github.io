#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

node scripts/sync-pages.mjs
git add -A -- .site publish-manifest.json

if git diff --cached --quiet; then
  echo "发布内容没有变化。"
  exit 0
fi

git diff --cached --stat
echo
read "answer?确认提交并推送到 charlot98.github.io？[y/N] "
if [[ "$answer" != [yY] ]]; then
  echo "已保留暂存内容，未提交或推送。"
  exit 0
fi

git commit -m "$(cat <<'EOF'
publish: update selected site versions

EOF
)"
git push origin main
