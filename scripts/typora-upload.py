#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import base64
import json
import requests
from datetime import datetime
from pathlib import Path

# 设置控制台输出编码
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

WORKER_URL = 'https://edit.upxuu.com'
ADMIN_PASSWORD = 'lijiaxu2011@2026'

def upload_image(image_path):
    """上传单张图片到图床"""
    try:
        if not os.path.exists(image_path):
            print(f"文件不存在：{image_path}", file=sys.stderr)
            return None
        
        # 生成文件名
        ext = Path(image_path).suffix.lower()
        timestamp = int(datetime.now().timestamp() * 1000)
        random_num = __import__('random').randint(0, 999)
        filename = f"{timestamp}_{random_num}{ext}"
        
        # 生成上传路径（年/月/日/文件名）
        now = datetime.now()
        upload_path = f"{now.year}/{now.month}/{now.day}/{filename}"
        
        # 读取图片并转为 base64
        with open(image_path, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        # 发送到 Worker API
        response = requests.post(
            f'{WORKER_URL}/api/upload',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {ADMIN_PASSWORD}'
            },
            json={
                'filename': upload_path,
                'content': image_data
            },
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"上传失败：{response.text}", file=sys.stderr)
            return None
        
        data = response.json()
        return data.get('url')
    
    except Exception as e:
        print(f"处理 {image_path} 时出错：{str(e)}", file=sys.stderr)
        return None

def main():
    # 解析参数，跳过脚本名和 --upload 标志
    args = sys.argv[1:]
    image_paths = [arg for arg in args if not arg.startswith('--')]
    
    if not image_paths:
        print("未提供图片路径", file=sys.stderr)
        sys.exit(1)
    
    urls = []
    for image_path in image_paths:
        url = upload_image(image_path)
        if url:
            urls.append(url)
    
    if urls:
        # 输出所有成功上传的 URL
        print('\n'.join(urls))
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()
