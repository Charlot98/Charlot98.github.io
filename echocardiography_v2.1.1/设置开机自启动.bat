@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
title 设置开机自启动
color 0B

echo ========================================
echo   心超报告生成器 - 设置开机自启动
echo ========================================
echo.

REM 获取当前脚本所在目录
cd /d "%~dp0"

REM 检查启动服务器.bat是否存在
if not exist "启动服务器.bat" (
    echo [错误] 未找到"启动服务器.bat"文件！
    echo 请确保此脚本与"启动服务器.bat"在同一目录下。
    echo.
    pause
    exit /b 1
)

REM 获取启动文件夹路径
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

REM 检查启动文件夹是否存在
if not exist "%STARTUP_FOLDER%" (
    echo [错误] 无法找到启动文件夹！
    echo 路径: %STARTUP_FOLDER%
    echo.
    pause
    exit /b 1
)

REM 获取当前bat文件的完整路径
set "BAT_FILE=%~dp0启动服务器.bat"

REM 检查是否已经存在快捷方式
set "SHORTCUT_NAME=心超报告生成器服务器.lnk"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\%SHORTCUT_NAME%"

if exist "%SHORTCUT_PATH%" (
    echo [提示] 检测到已存在开机自启动项
    echo.
    echo 是否要删除现有的自启动项？
    echo [Y] 删除并重新创建
    echo [N] 取消操作
    echo.
    choice /C YN /M "请选择"
    if errorlevel 2 (
        echo 操作已取消
        pause
        exit /b 0
    )
    if errorlevel 1 (
        del "%SHORTCUT_PATH%" >nul 2>&1
        echo [信息] 已删除旧的快捷方式
    )
)

REM 创建快捷方式到启动文件夹
echo [信息] 正在创建开机自启动项...
echo.

REM 使用PowerShell创建快捷方式
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%BAT_FILE%'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Description = '心超报告生成器服务器'; $Shortcut.Save()" >nul 2>&1

if %errorlevel% == 0 (
    echo ========================================
    echo   开机自启动设置成功！
    echo ========================================
    echo.
    echo 快捷方式已创建到启动文件夹：
    echo %STARTUP_FOLDER%
    echo.
    echo [提示] 下次开机时，服务器将自动启动
    echo [提示] 如需取消自启动，请运行"取消开机自启动.bat"
    echo.
    echo ========================================
) else (
    echo [错误] 创建快捷方式失败！
    echo.
    echo 可能原因：
    echo   1. 权限不足（请以管理员身份运行）
    echo   2. 启动文件夹不可访问
    echo.
    echo 您可以手动设置：
    echo   1. 按 Win+R，输入：shell:startup
    echo   2. 将"启动服务器.bat"的快捷方式复制到该文件夹
    echo.
)

echo.
pause

