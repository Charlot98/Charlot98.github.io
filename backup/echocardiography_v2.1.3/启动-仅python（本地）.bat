@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
title 心超报告生成器 - 本地服务器
color 0B

echo ========================================
echo   心超报告生成器 - Python本地服务器
echo   （仅本地访问，不占用局域网端口）
echo ========================================
echo.

REM 获取当前脚本所在目录
cd /d "%~dp0"

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python！
    echo.
    echo 请先安装Python: https://www.python.org/downloads/
    echo 安装时请勾选 "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

REM 检查HTML文件是否存在
if not exist "echocardiography.html" (
    echo [错误] 未找到 echocardiography.html 文件！
    echo 请确保此bat文件与echocardiography.html在同一目录下。
    echo.
    pause
    exit /b 1
)

REM 检查端口是否已被占用
netstat -ano | findstr ":3306" | findstr "LISTENING" >nul
if %errorlevel% == 0 (
    echo [警告] 端口3306已被占用！
    echo 请先运行"停止服务器.bat"停止现有服务器
    echo.
    pause
    exit /b 1
)

echo [信息] 正在启动本地服务器...
echo [提示] 服务器仅监听本地（127.0.0.1），局域网无法访问
echo.

REM 启动Python HTTP服务器到独立进程（完全隐藏窗口，后台运行）
REM 绑定到127.0.0.1，只允许本地访问，不占用局域网端口
if exist "%~dp0server_local.py" (
    REM 使用本地服务器脚本（推荐）
    powershell -Command "$pwd = '%CD%'; Start-Process -FilePath 'python' -ArgumentList '%~dp0server_local.py' -WorkingDirectory $pwd -WindowStyle Hidden" >nul 2>&1
) else (
    REM 使用标准http.server，绑定到127.0.0.1
    powershell -Command "$pwd = '%CD%'; Start-Process -FilePath 'python' -ArgumentList '-m','http.server','3306','--bind','127.0.0.1' -WorkingDirectory $pwd -WindowStyle Hidden" >nul 2>&1
)

REM 等待服务器启动
timeout /t 3 /nobreak >nul

REM 检查服务器是否成功启动（重试机制）
set "RETRY_COUNT=0"
:check_server
netstat -ano | findstr "127.0.0.1:3306" | findstr "LISTENING" >nul
if %errorlevel% == 0 (
    REM 服务器启动成功，显示访问地址
    echo ========================================
    echo   服务器启动成功！
    echo ========================================
    echo.
    echo 本地访问地址:
    echo   http://localhost:3306/echocardiography.html
    echo.
    echo [提示] 服务器仅在本地运行
    echo [提示] 局域网其他设备无法访问
    echo [提示] 关闭此窗口不会影响服务器运行
    echo.
    echo ========================================
    echo.
    echo 窗口将在10秒后自动关闭...
    timeout /t 10 /nobreak >nul
    exit /b 0
) else (
    REM 如果还没启动，再等待一下
    set /a RETRY_COUNT+=1
    if !RETRY_COUNT! LSS 3 (
        timeout /t 1 /nobreak >nul
        goto :check_server
    )
    
    REM 服务器启动失败
    echo [错误] 服务器启动失败！
    echo.
    echo 可能原因:
    echo   1. 端口3306已被占用
    echo   2. Python版本过低（需要Python 3.4+）
    echo.
    pause
    exit /b 1
)

