@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
title 取消开机自启动
color 0B

echo ========================================
echo   心超报告生成器 - 取消开机自启动
echo ========================================
echo.

REM 获取启动文件夹路径
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_NAME=心超报告生成器服务器.lnk"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\%SHORTCUT_NAME%"

REM 检查快捷方式是否存在
if not exist "%SHORTCUT_PATH%" (
    echo [提示] 未找到开机自启动项
    echo 服务器可能未设置开机自启动
    echo.
    pause
    exit /b 0
)

echo [信息] 找到开机自启动项
echo 路径: %SHORTCUT_PATH%
echo.
echo 是否要删除此自启动项？
choice /C YN /M "请选择 [Y]删除 [N]取消"

if errorlevel 2 (
    echo 操作已取消
    pause
    exit /b 0
)

REM 删除快捷方式
del "%SHORTCUT_PATH%" >nul 2>&1

if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo   开机自启动已取消！
    echo ========================================
    echo.
    echo [提示] 下次开机时，服务器将不会自动启动
    echo [提示] 如需重新设置，请运行"设置开机自启动.bat"
    echo.
    echo ========================================
) else (
    echo.
    echo [错误] 删除失败！
    echo 可能原因：权限不足（请以管理员身份运行）
    echo.
    echo 您可以手动删除：
    echo   1. 按 Win+R，输入：shell:startup
    echo   2. 删除"心超报告生成器服务器.lnk"文件
    echo.
)

echo.
pause

