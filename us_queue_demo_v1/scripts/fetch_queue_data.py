#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import configparser
import csv
import datetime as dt
import json
import pathlib
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, List


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
        parsed = json.loads(data)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"返回不是 JSON: {data[:300]}") from e
    return parsed


def mask_phone(phone: str) -> str:
    s = (phone or "").strip()
    if len(s) >= 7 and s.isdigit():
        return s[:3] + "****" + s[-4:]
    return s


def flatten_get99(data: List[Dict[str, Any]], mask: bool) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for group in data:
        kind = group.get("kind", "")
        for bucket in ("listnocall", "listcalling", "listpass", "listcallover"):
            for item in group.get(bucket, []) or []:
                row = dict(item)
                row["queue_bucket"] = bucket
                row["kind_group"] = kind
                if mask:
                    row["pat_phone"] = mask_phone(str(row.get("pat_phone", "")))
                rows.append(row)
    return rows


def normalize_rows(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    keys = set()
    for r in rows:
        keys.update(r.keys())
    ordered = sorted(keys)
    return [{k: r.get(k, "") for k in ordered} for r in rows]


def write_json(path: pathlib.Path, obj: Any) -> None:
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def write_csv(path: pathlib.Path, rows: List[Dict[str, Any]]) -> None:
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    rows = normalize_rows(rows)
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser(description="抓取超声排队叫号数据并导出 JSON/CSV")
    parser.add_argument("--ini", default=str(DEFAULT_INI), help="ClientOption.ini 路径")
    parser.add_argument("--date", default=dt.date.today().isoformat(), help="业务日期，例如 2026-04-21")
    parser.add_argument("--room", type=int, default=None, help="房间号，默认读取 ini")
    parser.add_argument("--token", default=DEFAULT_TOKEN, help="接口 token")
    parser.add_argument("--out", default=str(PROJECT_ROOT / "exports"), help="输出目录（默认项目根下 exports）")
    parser.add_argument("--mask-phone", action="store_true", help="导出时手机号脱敏")
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
    payload = {"date": args.date, "room": room}

    print(f"[信息] 请求地址: {base_url}")
    print(f"[信息] 参数: date={args.date}, room={room}")

    r01 = post_action(base_url, args.token, "RH_GET01LIST", payload)
    r99 = post_action(base_url, args.token, "RH_GET99LIST", payload)

    if r01.get("code") != 0:
        print(f"[警告] RH_GET01LIST 返回异常: {r01}", file=sys.stderr)
    if r99.get("code") != 0:
        print(f"[警告] RH_GET99LIST 返回异常: {r99}", file=sys.stderr)

    out_dir = pathlib.Path(args.out)
    if not out_dir.is_absolute():
        out_dir = PROJECT_ROOT / out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    file_stem = f"{args.date}_room{room}"
    raw01_path = out_dir / f"RH_GET01LIST_{file_stem}.json"
    raw99_path = out_dir / f"RH_GET99LIST_{file_stem}.json"
    csv01_path = out_dir / f"RH_GET01LIST_{file_stem}.csv"
    csv99_path = out_dir / f"RH_GET99LIST_flat_{file_stem}.csv"

    write_json(raw01_path, r01)
    write_json(raw99_path, r99)

    rows01 = r01.get("data", []) if isinstance(r01.get("data"), list) else []
    rows99 = flatten_get99(r99.get("data", []) if isinstance(r99.get("data"), list) else [], args.mask_phone)
    if args.mask_phone:
        for row in rows01:
            row["pat_phone"] = mask_phone(str(row.get("pat_phone", "")))

    write_csv(csv01_path, rows01)
    write_csv(csv99_path, rows99)

    print(f"[完成] JSON: {raw01_path}")
    print(f"[完成] JSON: {raw99_path}")
    print(f"[完成] CSV : {csv01_path}")
    print(f"[完成] CSV : {csv99_path}")
    print(f"[统计] RH_GET01LIST 条数: {len(rows01)}")
    print(f"[统计] RH_GET99LIST 扁平条数: {len(rows99)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
