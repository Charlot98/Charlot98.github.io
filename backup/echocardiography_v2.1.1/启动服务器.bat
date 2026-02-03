@echo off
chcp 65001 >nul
REM 心超报告生成器 - 服务器启动脚本（Windows双击运行）

REM 获取脚本所在目录
cd /d "%~dp0"

REM 检查是否存在 echocardiography.html
if not exist "echocardiography.html" (
    echo.
    echo ============================================================
    echo ❌ 错误：未找到 echocardiography.html 文件
    echo ============================================================
    echo.
    echo 当前目录：%~dp0
    echo.
    echo 请确保 echocardiography.html 文件在当前目录或子目录中
    echo 💡 提示：将启动脚本和 echocardiography.html 放在同一文件夹即可
    echo.
    pause
    exit /b 1
)

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        echo.
        echo ============================================================
        echo ❌ 错误：未找到 Python
        echo ============================================================
        echo.
        echo 请先安装 Python3
        echo 下载地址：https://www.python.org/downloads/
        echo.
        echo 💡 安装时请勾选 "Add Python to PATH" 选项
        echo.
        pause
        exit /b 1
    )
    set PYTHON_CMD=python3
) else (
    set PYTHON_CMD=python
)

REM 检查是否存在 start_server.py
if not exist "start_server.py" (
    echo.
    echo ============================================================
    echo ❌ 错误：未找到 start_server.py 文件
    echo ============================================================
    echo.
    echo 请确保 start_server.py 文件在当前目录中
    echo.
    pause
    exit /b 1
)

REM 运行Python服务器脚本
echo.
echo ============================================================
echo 心超报告生成器 - 正在启动服务器...
echo ============================================================
echo.

REM 运行Python服务器（服务器会持续运行，直到按Ctrl+C）
%PYTHON_CMD% start_server.py

REM 如果服务器停止（用户按了Ctrl+C或出错），暂停以便查看输出
echo.
echo ============================================================
echo 服务器已停止
echo ============================================================
echo.
pause

