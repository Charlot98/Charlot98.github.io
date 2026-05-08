#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import configparser
import datetime as dt
import json
import pathlib
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional

_SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = _SCRIPT_DIR.parent

DEFAULT_TOKEN = "ytsoftwareCNAMU"
DEFAULT_INI = PROJECT_ROOT / "超声排队叫号" / "ClientOption.ini"


def read_client_option(path: pathlib.Path) -> Dict[str, str]:
    cp = configparser.ConfigParser()
    with path.open("r", encoding="utf-8") as f:
        cp.read_file(f)
    if "Option" not in cp:
        raise ValueError(f"配置文件缺少 [Option] 节: {path}")
    section = cp["Option"]
    return {
        "ServerIP": section.get("ServerIP", "").strip(),
        "ServerPort": section.get("ServerPort", "").strip(),
        "Room": section.get("Room", "").strip(),
    }


def post_action(base_url: str, token: str, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    query = urllib.parse.urlencode({"action": action, "token": token})
    url = f"{base_url}?{query}"
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        url=url,
        data=body,
        method="POST",
        headers={"Content-Type": "application/json;charset=UTF-8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTPError {e.code} {e.reason}: {detail[:300]}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"网络错误: {e}") from e

    try:
        return json.loads(data)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"返回不是 JSON: {data[:300]}") from e


def normalize_code(raw: str) -> str:
    value = raw.strip().upper()
    if not value:
        return ""
    return value


def extract_numeric(value: str) -> Optional[int]:
    m = re.search(r"\d+", value or "")
    if not m:
        return None
    try:
        return int(m.group(0))
    except ValueError:
        return None


def fetch_waiting_rows(base_url: str, token: str, date_str: str, room: int) -> List[Dict[str, Any]]:
    resp = post_action(base_url, token, "RH_GET01LIST", {"date": date_str, "room": room})
    rows = resp.get("data")
    if resp.get("code") != 0:
        raise RuntimeError(f"RH_GET01LIST 失败: {resp}")
    if not isinstance(rows, list):
        return []
    return rows


def match_row(rows: List[Dict[str, Any]], code: str) -> Optional[Dict[str, Any]]:
    # 优先：扫码值与 serial_no 完全匹配
    for row in rows:
        if str(row.get("serial_no", "")).strip().upper() == code:
            return row

    # 其次：提取数字匹配 xh（支持 C0096 / 96 等）
    numeric = extract_numeric(code)
    if numeric is not None:
        for row in rows:
            try:
                if int(float(row.get("xh", 0))) == numeric:
                    return row
            except (ValueError, TypeError):
                continue
    return None


def build_remove_skin_payloads(row: Dict[str, Any], date_str: str, room: int) -> List[Dict[str, Any]]:
    payloads: List[Dict[str, Any]] = []
    xh = row.get("xh")
    serial_no = row.get("serial_no")
    patient_id = row.get("patient_id")
    hospitalid = row.get("hospitalid")

    # 服务端字段可能存在版本差异，按常见组合依次尝试。
    payloads.append({"date": date_str, "room": room, "xh": xh})
    payloads.append({"date": date_str, "room": room, "xh": xh, "serial_no": serial_no})
    payloads.append({"date": date_str, "room": room, "serial_no": serial_no})
    payloads.append({"xh": xh, "serial_no": serial_no})
    payloads.append({"serial_no": serial_no})
    payloads.append({"xh": xh})
    payloads.append({"patient_id": patient_id, "date": date_str, "room": room})
    payloads.append({"hospitalid": hospitalid, "xh": xh, "date": date_str, "room": room})

    # 清理 None/空串字段，避免后端参数校验失败。
    cleaned: List[Dict[str, Any]] = []
    for p in payloads:
        q = {k: v for k, v in p.items() if v not in (None, "")}
        if q and q not in cleaned:
            cleaned.append(q)
    return cleaned


def remove_skin(base_url: str, token: str, payloads: List[Dict[str, Any]]) -> Dict[str, Any]:
    last_resp: Dict[str, Any] = {}
    for idx, payload in enumerate(payloads, start=1):
        resp = post_action(base_url, token, "RH_RemoveSkin", payload)
        last_resp = resp
        if resp.get("code") == 0:
            print(f"[成功] RH_RemoveSkin 调用成功（尝试#{idx}） payload={payload}")
            return resp
        print(f"[失败] RH_RemoveSkin 尝试#{idx} code={resp.get('code')} msg={resp.get('msg')} payload={payload}")
    return last_resp


def main() -> int:
    parser = argparse.ArgumentParser(description="不改 EXE：扫码后自动调用 RH_RemoveSkin")
    parser.add_argument("--ini", default=str(DEFAULT_INI), help="ClientOption.ini 路径")
    parser.add_argument("--date", default=dt.date.today().isoformat(), help="业务日期，例如 2026-04-21")
    parser.add_argument("--room", type=int, default=None, help="房间号，默认读取 ini")
    parser.add_argument("--token", default=DEFAULT_TOKEN, help="接口 token")
    args = parser.parse_args()

    ini_path = pathlib.Path(args.ini)
    if not ini_path.is_absolute():
        ini_path = PROJECT_ROOT / ini_path
    if not ini_path.exists():
        print(f"[错误] 找不到配置文件: {ini_path}", file=sys.stderr)
        return 1

    cfg = read_client_option(ini_path)
    ip = cfg["ServerIP"]
    port = cfg["ServerPort"]
    if not ip or not port:
        print("[错误] 配置文件缺少 ServerIP/ServerPort", file=sys.stderr)
        return 1

    room = args.room if args.room is not None else int(cfg["Room"] or 0)
    if room <= 0:
        print("[错误] 无效 room，请用 --room 指定正整数", file=sys.stderr)
        return 1

    base_url = f"http://{ip}:{port}/CNAMURegister.ashx"
    print(f"[信息] 服务地址: {base_url}")
    print(f"[信息] date={args.date}, room={room}")
    print("[信息] 请开始扫码（回车提交），输入 q 退出。")

    while True:
        try:
            raw = input("扫码内容> ")
        except (EOFError, KeyboardInterrupt):
            print("\n[退出] 已停止。")
            return 0

        code = normalize_code(raw)
        if not code:
            continue
        if code.lower() in {"q", "quit", "exit"}:
            print("[退出] 已停止。")
            return 0

        try:
            rows = fetch_waiting_rows(base_url, args.token, args.date, room)
            row = match_row(rows, code)
            if not row:
                print(f"[未匹配] 未在 RH_GET01LIST 中找到该条码/序号: {code}")
                continue

            payloads = build_remove_skin_payloads(row, args.date, room)
            resp = remove_skin(base_url, args.token, payloads)
            if resp.get("code") == 0:
                xh = row.get("xh", "-")
                serial_no = row.get("serial_no", "-")
                name = row.get("name", "-")
                print(f"[完成] 已剃毛: xh={xh}, serial_no={serial_no}, name={name}")
            else:
                print(f"[失败] 所有尝试均失败，最后返回: {resp}")
        except Exception as e:
            print(f"[异常] {e}", file=sys.stderr)


if __name__ == "__main__":
    raise SystemExit(main())
