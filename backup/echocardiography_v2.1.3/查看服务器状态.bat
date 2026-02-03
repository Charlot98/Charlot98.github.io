@echo off
chcp 65001 >nul 2>&1
title 查看服务器状态
color 0B

echo ========================================
echo   服务器状态检查
echo ========================================
echo.

REM 检查Python进程
echo [1] 检查Python进程...
tasklist /FI "IMAGENAME eq python.exe" 2>nul | find /I "python.exe" >nul
if %errorlevel% == 0 (
    echo [状态] ✓ Python进程正在运行
    echo.
    tasklist /FI "IMAGENAME eq python.exe" /FO TABLE
) else (
    echo [状态] ✗ 未找到Python进程
)
echo.

REM 检查端口
echo [2] 检查端口3306...
netstat -ano | findstr ":3306" | findstr "LISTENING" >nul
if %errorlevel% == 0 (
    echo [状态] ✓ 端口3306正在监听
    echo.
    netstat -ano | findstr ":3306" | findstr "LISTENING"
) else (
    echo [状态] ✗ 端口3306未被占用
)
echo.

REM 显示访问地址
echo [3] 访问地址:
echo   本地: http://localhost:3306/echocardiography.html
echo.

REM 获取IP地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "IP=%%a"
    set "IP=!IP:~1!"
    goto :found_ip
)
:found_ip
if defined IP (
    echo   局域网: http://%IP%:3306/echocardiography.html
)

echo.
echo ========================================
echo   按任意键退出...
pause >nul

