#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的文件上传服务器
用于将上传的图片保存到 public 文件夹
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 确保 public 文件夹存在
PUBLIC_DIR = 'public'
if not os.path.exists(PUBLIC_DIR):
    os.makedirs(PUBLIC_DIR)

@app.route('/upload', methods=['POST'])
def upload_file():
    """处理文件上传"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': '没有文件'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '文件名为空'}), 400
        
        # 生成基于时间的文件名
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        # 获取文件扩展名
        ext = os.path.splitext(file.filename)[1] or '.jpg'
        # 添加唯一ID避免重名
        unique_id = str(uuid.uuid4())[:8]
        filename = f"{timestamp}_{unique_id}{ext}"
        
        # 保存文件
        filepath = os.path.join(PUBLIC_DIR, filename)
        file.save(filepath)
        
        # 返回文件路径（相对于 public 文件夹）
        return jsonify({
            'success': True,
            'filename': filename,
            'path': f'public/{filename}',
            'url': f'/public/{filename}'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/public/<path:filename>')
def serve_file(filename):
    """提供静态文件服务"""
    return send_from_directory(PUBLIC_DIR, filename)

@app.route('/')
def index():
    return jsonify({'message': '文件上传服务器运行中'})

if __name__ == '__main__':
    print('=' * 50)
    print('文件上传服务器启动')
    print('=' * 50)
    print(f'Public 文件夹: {os.path.abspath(PUBLIC_DIR)}')
    print('服务器地址: http://localhost:5000')
    print('=' * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)

