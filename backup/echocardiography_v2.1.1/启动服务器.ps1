# 心超报告生成器 - PowerShell启动脚本（Windows）
# 编码：UTF-8

# 获取脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# 检查Python是否安装
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} else {
    Write-Host "❌ 错误：未找到 Python" -ForegroundColor Red
    Write-Host "   请先安装 Python3" -ForegroundColor Yellow
    Write-Host "   下载地址：https://www.python.org/downloads/" -ForegroundColor Cyan
    Read-Host "按回车键退出"
    exit 1
}

# 运行Python服务器脚本
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "心超报告生成器 - 正在启动服务器..." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

& $pythonCmd start_server.py

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ 服务器启动失败" -ForegroundColor Red
    Read-Host "按回车键退出"
}

