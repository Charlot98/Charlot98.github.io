@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

REM 查找占用3306端口的进程
set "PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3306" ^| findstr "LISTENING"') do (
    set "PID=%%a"
    goto :found_pid
)

REM 如果没找到端口，尝试查找所有python进程
tasklist /FI "IMAGENAME eq python.exe" 2>nul | find /I "python.exe" >nul
if %errorlevel% == 0 (
    REM 找到Python进程，停止所有python进程
    taskkill /F /IM python.exe /T >nul 2>&1
    if %errorlevel% == 0 (
        set "STOPPED=1"
    ) else (
        set "STOPPED=0"
    )
) else (
    REM 未找到运行中的服务器
    powershell -Command "[System.Windows.Forms.MessageBox]::Show('未找到运行中的服务器！', '提示', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)"
    exit /b 0
)

:found_pid
if defined PID (
    REM 停止占用端口的进程
    taskkill /F /PID %PID% >nul 2>&1
    if %errorlevel% == 0 (
        set "STOPPED=1"
    ) else (
        set "STOPPED=0"
    )
)

REM 等待端口释放
timeout /t 1 /nobreak >nul

REM 检查端口是否已释放
netstat -ano | findstr ":3306" | findstr "LISTENING" >nul
if %errorlevel% == 0 (
    REM 端口仍被占用
    powershell -Command "[System.Windows.Forms.MessageBox]::Show('服务器停止失败！`n`n端口3306仍被占用。`n可能需要管理员权限或手动关闭。', '停止失败', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)"
) else (
    REM 服务器已成功停止
    powershell -Command "[System.Windows.Forms.MessageBox]::Show('服务器已成功停止！`n`n局域网访问已关闭。', '服务器已停止', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)"
)

