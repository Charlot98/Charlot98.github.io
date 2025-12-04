#!/bin/bash
# 心超报告生成器 - 服务器启动脚本（macOS/Linux）

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到 Python3"
    echo "   请先安装 Python3"
    exit 1
fi

# 运行Python服务器脚本
python3 start_server.py

