#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
最轻量：按日期实时提取工作站病例字段（默认当天）
字段：
- 病人姓名
- 宠物昵称
- 检查ID
- 登记时间
- 检查状态
- 检查部位
"""

from __future__ import annotations

import argparse
import configparser
import csv
import datetime as dt
import json
import pathlib
import sys
import time
from typing import Any, Dict, List


_SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = _SCRIPT_DIR.parent
DEFAULT_DB_INI = pathlib.Path("超声报告工作站圣天硬狗网络版/config/DBconfig.ini")
DEFAULT_DB_INI_LOCAL = pathlib.Path("超声报告工作站圣天硬狗网络版/config/DBconfigLocal.ini")
DEFAULT_OUT_DIR = PROJECT_ROOT / "exports"


def read_db_config(path: pathlib.Path) -> Dict[str, str]:
    last_err: Exception | None = None
    for enc in ("utf-8", "gbk", "gb18030", "latin-1"):
        cp = configparser.ConfigParser(interpolation=None)
        try:
            raw = path.read_text(encoding=enc)
            cleaned = "\n".join(line for line in raw.splitlines() if not line.strip().startswith("//"))
            cp.read_string(cleaned)
            sec = cp["SQLSERVER"]
            return {
                "host": sec.get("Host", "").strip(),
                "user": sec.get("User", "").strip(),
                "password": sec.get("Passwd", "").strip(),
                "db": sec.get("DB", "").strip(),
                "port": sec.get("Port", "").strip(),
            }
        except Exception as e:
            last_err = e
    if last_err is not None:
        raise last_err
    raise RuntimeError("无法读取数据库配置")


def pick_db_config(project_root: pathlib.Path, main_ini: str, local_ini: str, host_override: str) -> Dict[str, str]:
    for p in (pathlib.Path(main_ini), pathlib.Path(local_ini)):
        rp = p if p.is_absolute() else (project_root / p).resolve()
        if not rp.exists():
            continue
        try:
            cfg = read_db_config(rp)
        except Exception:
            continue
        if host_override.strip():
            cfg["host"] = host_override.strip()
        if cfg["host"] and cfg["user"] and cfg["db"]:
            cfg["_from"] = str(rp)
            return cfg
    raise RuntimeError("未找到可用 DB 配置（DBconfig.ini / DBconfigLocal.ini）")


def query_rows(cfg: Dict[str, str], day: str, limit: int) -> List[Dict[str, Any]]:
    import pymssql  # type: ignore

    sql = """
SELECT TOP %s
  CAST(t.patientName AS NVARCHAR(200)) AS 病人姓名,
  CAST(ISNULL(NULLIF(t.patientUserDefine1, ''), t.patientName) AS NVARCHAR(200)) AS 宠物昵称,
  CAST(e.examinationID AS NVARCHAR(64)) AS 检查ID,
  CAST(
    ISNULL(NULLIF(CONVERT(NVARCHAR(10), e.registerdate, 23), ''), '') + ' ' +
    ISNULL(NULLIF(CONVERT(NVARCHAR(8), e.registertime, 108), ''), '')
    AS NVARCHAR(32)
  ) AS 登记时间,
  CAST(e.examinationStatus AS NVARCHAR(64)) AS 检查状态,
  CAST(ISNULL(e.examineParts, '') AS NVARCHAR(500)) AS 检查部位
FROM t_examination e
LEFT JOIN t_patient t ON e.patientID = t.patientID
WHERE TRY_CONVERT(date, e.registerdate) = TRY_CONVERT(date, %s)
ORDER BY e.registerdate DESC, e.registertime DESC, e.examinationID DESC;
"""

    port = int(cfg["port"]) if cfg["port"] else 1433
    with pymssql.connect(
        server=cfg["host"],
        user=cfg["user"],
        password=cfg["password"],
        database=cfg["db"],
        port=port,
        login_timeout=8,
        timeout=8,
        charset="utf8",
    ) as conn:
        cur = conn.cursor(as_dict=True)
        cur.execute(sql, (limit, day))
        rows = cur.fetchall() or []

    normalized: List[Dict[str, Any]] = []
    for r in rows:
        normalized.append(
            {
                "病人姓名": (r.get("病人姓名") or "").strip(),
                "宠物昵称": (r.get("宠物昵称") or "").strip(),
                "检查ID": str(r.get("检查ID") or "").strip(),
                "登记时间": (r.get("登记时间") or "").strip(),
                "检查状态": (r.get("检查状态") or "").strip(),
                "检查部位": (r.get("检查部位") or "").strip(),
            }
        )
    return normalized


def write_outputs(out_dir: pathlib.Path, day: str, rows: List[Dict[str, Any]]) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    json_path = out_dir / f"WS_CASES_MIN_{day}.json"
    csv_path = out_dir / f"WS_CASES_MIN_{day}.csv"

    json_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    with csv_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["病人姓名", "宠物昵称", "检查ID", "登记时间", "检查状态", "检查部位"])
        writer.writeheader()
        writer.writerows(rows)


def run_once(cfg: Dict[str, str], day: str, limit: int, out_dir: pathlib.Path) -> int:
    rows = query_rows(cfg, day, limit)
    write_outputs(out_dir, day, rows)
    ts = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] 完成: {day} 条数={len(rows)} 输出={out_dir}", flush=True)
    return len(rows)


def main() -> int:
    parser = argparse.ArgumentParser(description="最轻量实时提取工作站病例字段")
    parser.add_argument("--date", default=dt.date.today().isoformat(), help="日期 YYYY-MM-DD，默认当天")
    parser.add_argument("--limit", type=int, default=5000, help="最大返回条数，默认 5000")
    parser.add_argument("--interval", type=int, default=5, help="实时轮询秒数，默认 5 秒")
    parser.add_argument("--once", action="store_true", help="只提取一次")
    parser.add_argument("--db-ini", default=str(DEFAULT_DB_INI), help="主数据库配置路径")
    parser.add_argument("--db-ini-local", default=str(DEFAULT_DB_INI_LOCAL), help="备用数据库配置路径")
    parser.add_argument("--host", default="", help="可选：临时覆盖数据库主机")
    parser.add_argument("--out-dir", default=str(DEFAULT_OUT_DIR), help="输出目录，默认项目根下 exports")
    args = parser.parse_args()

    project_root = PROJECT_ROOT
    out_dir = pathlib.Path(args.out_dir)
    if not out_dir.is_absolute():
        out_dir = (project_root / out_dir).resolve()

    try:
        cfg = pick_db_config(project_root, args.db_ini, args.db_ini_local, args.host)
    except Exception as e:
        print(f"[错误] 读取数据库配置失败: {e}", file=sys.stderr)
        return 1

    print(f"[信息] 使用配置: {cfg.get('_from', '')}", flush=True)
    print(f"[信息] 目标日期: {args.date}", flush=True)

    try:
        run_once(cfg, args.date, args.limit, out_dir)
    except Exception as e:
        print(f"[错误] 首次提取失败: {e}", file=sys.stderr)
        return 2

    if args.once:
        return 0

    print(f"[信息] 实时模式启动，每 {max(1, args.interval)} 秒刷新一次", flush=True)
    while True:
        time.sleep(max(1, args.interval))
        try:
            run_once(cfg, args.date, args.limit, out_dir)
        except Exception as e:
            print(f"[警告] 本轮提取失败: {e}", file=sys.stderr, flush=True)


if __name__ == "__main__":
    raise SystemExit(main())
