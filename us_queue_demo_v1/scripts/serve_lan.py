#!/usr/bin/env python3
"""
在项目根目录启动静态 HTTP，绑定 0.0.0.0，供局域网内手机/其它电脑访问。

用法（在项目根或任意目录）:
  python3 scripts/serve_lan.py
  PORT=9000 python3 scripts/serve_lan.py

请与本机代理同时开启（已监听 0.0.0.0:18080）:
  python3 scripts/call_number_proxy.py

用手机浏览器打开示例（将 IP 换成下方打印的局域网地址）:
  http://<局域网IP>:8000/web/queue_screen2.html
"""
from __future__ import annotations

import functools
import os
import socket
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_PORT = 8000


def guess_lan_ipv4() -> str | None:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.3)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except OSError:
        return None


def main() -> None:
    port = int(os.environ.get("PORT", str(DEFAULT_PORT)))
    os.chdir(ROOT)

    handler = functools.partial(SimpleHTTPRequestHandler, directory=ROOT)
    ThreadingHTTPServer.allow_reuse_address = True
    httpd = ThreadingHTTPServer(("0.0.0.0", port), handler)

    lan = guess_lan_ipv4()
    print(f"静态根目录: {ROOT}")
    print(f"监听 http://0.0.0.0:{port}（局域网可访问）")
    print(f"  本机打开: http://127.0.0.1:{port}/web/index.html")
    if lan:
        print(f"  局域网打开: http://{lan}:{port}/web/index.html")
    else:
        print("  （未能自动探测局域网 IP，请在系统网络设置中查看本机 IPv4）")
    print("代理 API 需单独运行: python3 scripts/call_number_proxy.py （端口 18080）")
    print("若手机连不上，请检查本机防火墙是否放行 TCP", port, "与 18080")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止")
        sys.exit(0)


if __name__ == "__main__":
    main()
