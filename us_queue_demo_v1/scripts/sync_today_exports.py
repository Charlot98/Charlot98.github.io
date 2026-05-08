#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import datetime as dt
import pathlib
import subprocess
import sys
import time

_SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = _SCRIPT_DIR.parent


def run_once(project_root: pathlib.Path, room: int, ini_path: pathlib.Path, out_dir: str) -> int:
    today = dt.date.today().isoformat()
    cmd = [
        sys.executable,
        str(project_root / "scripts" / "fetch_queue_data.py"),
        "--date",
        today,
        "--room",
        str(room),
        "--ini",
        str(ini_path),
        "--out",
        out_dir,
    ]
    result = subprocess.run(cmd, cwd=str(project_root), capture_output=True, text=True)
    ts = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if result.returncode == 0:
        print(f"[{ts}] 同步成功: {today} room={room}", flush=True)
        return 0
    print(f"[{ts}] 同步失败: {today} room={room}", file=sys.stderr, flush=True)
    if result.stdout:
        print(result.stdout.strip(), file=sys.stderr, flush=True)
    if result.stderr:
        print(result.stderr.strip(), file=sys.stderr, flush=True)
    return result.returncode


def main() -> int:
    parser = argparse.ArgumentParser(description="循环同步当日导出数据到 exports 目录")
    parser.add_argument("--room", type=int, default=15, help="房间号，默认 15")
    parser.add_argument(
        "--ini",
        default="超声排队叫号/ClientOption.ini",
        help="ClientOption.ini 路径（相对项目根）",
    )
    parser.add_argument("--out", default="exports", help="导出目录，默认 exports")
    parser.add_argument("--interval", type=int, default=30, help="同步间隔秒数，默认 30")
    parser.add_argument("--once", action="store_true", help="只执行一次后退出")
    args = parser.parse_args()

    project_root = PROJECT_ROOT
    ini_path = (project_root / args.ini).resolve() if not pathlib.Path(args.ini).is_absolute() else pathlib.Path(args.ini)
    if not ini_path.exists():
        print(f"[错误] 找不到 ini 文件: {ini_path}", file=sys.stderr)
        return 1

    run_once(project_root, args.room, ini_path, args.out)
    if args.once:
        return 0

    print(f"[信息] 已启动当日自动同步: room={args.room}, interval={args.interval}s", flush=True)
    while True:
        time.sleep(max(3, args.interval))
        run_once(project_root, args.room, ini_path, args.out)


if __name__ == "__main__":
    raise SystemExit(main())
