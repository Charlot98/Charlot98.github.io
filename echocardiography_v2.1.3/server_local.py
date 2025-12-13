#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
本地HTTP服务器 - 仅监听127.0.0.1，不占用局域网端口
"""
import http.server
import socketserver
import os
import socket
import json
from datetime import datetime
from urllib.parse import urlparse

PORT = 3306
BIND_ADDRESS = '127.0.0.1'  # 只绑定本地，不占用局域网端口

class LocalHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """本地HTTP请求处理器"""
    
    def log_message(self, format, *args):
        """禁用日志输出"""
        pass  # 不输出日志
    
    def do_POST(self):
        """处理POST请求"""
        parsed_path = urlparse(self.path)
        
        # 处理反馈保存请求
        if parsed_path.path == '/save_feedback':
            try:
                # 读取请求体
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # 解析JSON数据
                feedback_data = json.loads(post_data.decode('utf-8'))
                
                # 获取logs文件夹路径
                script_dir = os.path.dirname(os.path.abspath(__file__))
                logs_dir = os.path.join(script_dir, 'logs')
                
                # 确保logs文件夹存在
                if not os.path.exists(logs_dir):
                    os.makedirs(logs_dir)
                
                # 生成文件名（包含时间戳）
                now = datetime.now()
                timestamp = now.strftime('%Y%m%d_%H%M%S')
                filename = f'问题反馈_{timestamp}.txt'
                filepath = os.path.join(logs_dir, filename)
                
                # 格式化反馈内容
                feedback_content = f"""=== 问题反馈 ===
时间: {now.strftime('%Y-%m-%d %H:%M:%S')}
疾病类型: {feedback_data.get('diseaseType', '未选择')}
参考范围: {feedback_data.get('referenceRange', '未选择')}
含辛普森测量: {feedback_data.get('simpsonStatus', '未激活')}
---
反馈内容:
{feedback_data.get('content', '')}
---
{'=' * 50}

"""
                
                # 保存到文件
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(feedback_content)
                
                # 返回成功响应
                response_data = {
                    'success': True,
                    'message': '反馈已成功保存',
                    'filename': filename
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
                
            except Exception as e:
                # 返回错误响应
                error_response = {
                    'success': False,
                    'message': f'保存失败: {str(e)}'
                }
                
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(error_response, ensure_ascii=False).encode('utf-8'))
        else:
            # 其他POST请求返回404
            self.send_response(404)
            self.end_headers()

def run_server():
    """启动本地HTTP服务器"""
    # 设置工作目录为脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # 创建logs文件夹
    logs_dir = os.path.join(script_dir, 'logs')
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
    
    # 服务器日志文件
    server_log_file = os.path.join(logs_dir, 'server.log')
    
    def log_message(message):
        """记录日志到文件"""
        try:
            with open(server_log_file, 'a', encoding='utf-8') as f:
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                f.write(f'[{timestamp}] {message}\n')
        except:
            pass  # 如果日志写入失败，静默忽略
    
    log_message('=' * 50)
    log_message('服务器启动中...')
    log_message(f'工作目录: {script_dir}')
    log_message(f'监听地址: {BIND_ADDRESS}:{PORT}')
    
    # 创建多线程服务器
    Handler = LocalHTTPRequestHandler
    Handler.directory = script_dir
    
    max_retries = 5
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # 使用ThreadingTCPServer支持多线程
            httpd = socketserver.ThreadingTCPServer((BIND_ADDRESS, PORT), Handler)
            httpd.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            httpd.timeout = 1
            httpd.allow_reuse_address = True
            
            log_message(f'服务器启动成功，开始监听端口 {PORT}')
            
            # 持续运行服务器
            httpd.serve_forever()
            
        except OSError as e:
            retry_count += 1
            error_msg = f'端口绑定错误 (尝试 {retry_count}/{max_retries}): {str(e)}'
            log_message(error_msg)
            
            if retry_count >= max_retries:
                log_message('服务器启动失败，已达到最大重试次数')
                break
            
            # 等待后重试
            import time
            time.sleep(2)
            
        except KeyboardInterrupt:
            log_message('收到中断信号，服务器正在关闭...')
            break
            
        except Exception as e:
            error_msg = f'服务器运行错误: {str(e)}'
            log_message(error_msg)
            log_message(f'错误类型: {type(e).__name__}')
            import traceback
            log_message(f'错误详情:\n{traceback.format_exc()}')
            
            # 对于未知错误，等待后重试
            retry_count += 1
            if retry_count >= max_retries:
                log_message('服务器因错误退出，已达到最大重试次数')
                break
            
            import time
            time.sleep(5)
            
        finally:
            try:
                if 'httpd' in locals():
                    httpd.shutdown()
                    httpd.server_close()
            except:
                pass
    
    log_message('服务器已停止')
    log_message('=' * 50)

if __name__ == '__main__':
    run_server()

