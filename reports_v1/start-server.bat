@echo off
echo ========================================
echo 启动文件上传服务器
echo ========================================
echo.

REM 检查是否安装了 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 Python，请先安装 Python 3.7 或更高版本
    pause
    exit /b 1
)

REM 检查是否安装了依赖
echo 检查依赖...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo 正在安装依赖...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

echo.
echo 启动服务器...
echo.
python server.py

pause
