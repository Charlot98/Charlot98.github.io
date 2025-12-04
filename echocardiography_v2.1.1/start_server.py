#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
心超报告生成器 - 本地服务器启动脚本
用于在局域网内访问HTML页面
支持 Windows、macOS、Linux
"""

import http.server
import socketserver
import socket
import os
import sys
import json
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse, parse_qs

# Windows 控制台编码设置
if sys.platform == 'win32':
    try:
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    except:
        pass

# 设置端口
PORT = 3456

# 获取本机局域网IP地址
def get_local_ip():
    """获取本机的局域网IP地址"""
    try:
        # 创建一个UDP socket来获取本机IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # 不需要真正连接，只是用来获取本机IP
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        # 如果上述方法失败，尝试其他方法
        try:
            hostname = socket.gethostname()
            ip = socket.gethostbyname(hostname)
            return ip
        except Exception:
            return "127.0.0.1"

# 自定义Handler，支持CORS（跨域资源共享）和禁用缓存
class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # 禁用缓存，确保总是获取最新文件
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        """自定义日志输出"""
        # 可以在这里自定义日志格式，或者完全禁用日志
        pass
    
    def do_OPTIONS(self):
        """处理预检请求"""
        self.send_response(200)
        self.end_headers()
    
    def do_POST(self):
        """处理POST请求，用于保存反馈"""
        if self.path == '/save_feedback':
            try:
                # 读取请求体
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                # 获取反馈内容
                feedback_content = data.get('content', '')
                disease_type = data.get('diseaseType', '未选择')
                reference_range = data.get('referenceRange', '未选择')
                simpson_status = data.get('simpsonStatus', '未激活')
                
                # 创建logs文件夹（如果不存在）
                logs_dir = Path(self.server.base_path) / 'logs'
                logs_dir.mkdir(exist_ok=True)
                
                # 生成文件名
                now = datetime.now()
                filename = f"问题反馈_{now.strftime('%Y%m%d_%H%M%S')}.txt"
                filepath = logs_dir / filename
                
                # 构建反馈内容
                timestamp = now.strftime('%Y-%m-%d %H:%M:%S')
                feedback_text = f"""=== 问题反馈 ===
时间: {timestamp}
疾病类型: {disease_type}
参考范围: {reference_range}
含辛普森测量: {simpson_status}
---
反馈内容:
{feedback_content}
---
{'=' * 50}

"""
                
                # 保存文件
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(feedback_text)
                
                # 返回成功响应
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                response = json.dumps({'success': True, 'message': '反馈已保存', 'filename': filename})
                self.wfile.write(response.encode('utf-8'))
                
            except Exception as e:
                # 返回错误响应
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                response = json.dumps({'success': False, 'message': f'保存失败: {str(e)}'})
                self.wfile.write(response.encode('utf-8'))
        else:
            # 其他POST请求，返回404
            self.send_response(404)
            self.end_headers()

def find_html_file(start_dir):
    """查找 echocardiography.html 文件"""
    html_file = Path(start_dir) / "echocardiography.html"
    if html_file.exists():
        return start_dir
    
    # 如果当前目录没有，尝试查找子目录
    for subdir in Path(start_dir).iterdir():
        if subdir.is_dir():
            html_file = subdir / "echocardiography.html"
            if html_file.exists():
                return str(subdir)
    
    return None

def main():
    # 获取当前脚本所在目录
    script_dir = Path(__file__).parent.absolute()
    
    # 查找 echocardiography.html 文件
    html_dir = find_html_file(script_dir)
    
    if html_dir is None:
        print("=" * 60)
        print("❌ 错误：未找到 echocardiography.html 文件")
        print("=" * 60)
        print(f"\n当前搜索目录：{script_dir}")
        print("\n请确保 echocardiography.html 文件在以下位置之一：")
        print(f"  1. {script_dir}/echocardiography.html")
        print(f"  2. {script_dir}/*/echocardiography.html (子目录中)")
        print("\n💡 提示：将启动脚本和 echocardiography.html 放在同一文件夹即可")
        print("=" * 60)
        sys.exit(1)
    
    # 切换到包含 HTML 文件的目录
    os.chdir(html_dir)
    print(f"✓ 找到文件：{Path(html_dir) / 'echocardiography.html'}")
    
    # 获取局域网IP
    local_ip = get_local_ip()
    
    # 创建服务器
    try:
        class CustomTCPServer(socketserver.TCPServer):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, **kwargs)
                self.base_path = html_dir
        
        with CustomTCPServer(("", PORT), CORSRequestHandler) as httpd:
            print("=" * 60)
            print("心超报告生成器 - 服务器已启动")
            print("=" * 60)
            print(f"\n📱 本机访问地址：")
            print(f"   http://localhost:{PORT}/echocardiography.html")
            print(f"   http://127.0.0.1:{PORT}/echocardiography.html")
            print(f"\n🌐 局域网访问地址：")
            print(f"   http://{local_ip}:{PORT}/echocardiography.html")
            print(f"\n💡 在同一Wi-Fi下的其他设备（手机/平板/电脑）")
            print(f"   可以使用上面的局域网地址访问")
            print(f"\n⚠️  按 Ctrl+C 停止服务器")
            print("=" * 60)
            print()
            
            # 启动服务器
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ 错误：端口 {PORT} 已被占用")
            print(f"   请关闭占用该端口的程序，或修改脚本中的 PORT 变量")
        else:
            print(f"❌ 错误：{e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n服务器已停止")
        sys.exit(0)

if __name__ == "__main__":
    main()

