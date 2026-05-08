#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
从“超声报告工作站圣天硬狗网络版”数据库读取病例信息并导出。

默认读取当日数据，也可通过 --date 指定日期（YYYY-MM-DD）。
优先使用 pyodbc，若不可用则尝试 pymssql。
"""

from __future__ import annotations

import argparse
import configparser
import csv
import datetime as dt
import json
import pathlib
import sys
from typing import Any, Dict, Iterable, List, Sequence, Tuple


_SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = _SCRIPT_DIR.parent
DEFAULT_DB_INI = pathlib.Path("超声报告工作站圣天硬狗网络版/config/DBconfig.ini")
DEFAULT_DB_INI_LOCAL = pathlib.Path("超声报告工作站圣天硬狗网络版/config/DBconfigLocal.ini")
DEFAULT_OUT_DIR = PROJECT_ROOT / "exports"


def read_db_config(path: pathlib.Path) -> Dict[str, str]:
    cp = configparser.ConfigParser(interpolation=None)
    last_err: Exception | None = None
    for enc in ("utf-8", "gbk", "gb18030", "latin-1"):
        try:
            raw = path.read_text(encoding=enc)
            # 兼容该程序配置中的 // 注释行
            cleaned = "\n".join(
                line for line in raw.splitlines() if not line.strip().startswith("//")
            )
            cp.read_string(cleaned)
            last_err = None
            break
        except Exception as e:
            cp = configparser.ConfigParser(interpolation=None)
            last_err = e
    if last_err is not None:
        raise last_err
    if "SQLSERVER" not in cp:
        raise ValueError(f"配置缺少 [SQLSERVER] 节: {path}")
    sec = cp["SQLSERVER"]
    return {
        "host": sec.get("Host", "").strip(),
        "user": sec.get("User", "").strip(),
        "password": sec.get("Passwd", "").strip(),
        "db": sec.get("DB", "").strip(),
        "port": sec.get("Port", "").strip(),
    }


def query_with_pyodbc(cfg: Dict[str, str], date_text: str, limit: int) -> Tuple[List[str], List[Tuple[Any, ...]]]:
    import pyodbc  # type: ignore

    drivers = list(pyodbc.drivers())
    if not drivers:
        raise RuntimeError("未检测到 ODBC Driver（pyodbc 可用但系统无 SQLServer 驱动）")

    preferred = [
        "ODBC Driver 18 for SQL Server",
        "ODBC Driver 17 for SQL Server",
        "ODBC Driver 13 for SQL Server",
        "SQL Server",
    ]
    driver = next((d for d in preferred if d in drivers), drivers[-1])

    server = cfg["host"]
    if cfg["port"]:
        server = f"{server},{cfg['port']}"

    conn_str = (
        f"DRIVER={{{driver}}};"
        f"SERVER={server};"
        f"DATABASE={cfg['db']};"
        f"UID={cfg['user']};"
        f"PWD={cfg['password']};"
        "TrustServerCertificate=yes;"
    )
    sql = """
SELECT TOP (?) 
  e.examinationID,
  e.examinationNum,
  e.examineDate,
  e.examineTime,
  e.registerdate,
  e.registertime,
  e.reportDate,
  e.reportTime,
  e.examinationStatus,
  e.examineType,
  e.examineParts,
  e.sentByDoctor,
  e.reportDoctorName,
  e.clinicalDiagnosis,
  e.majorTell,
  e.medicalRecords,
  t.patientID,
  t.patientNum,
  t.patientName,
  t.patientSex,
  t.patientAge,
  t.patientAgeUnit,
  t.patientTelephone,
  e.clinicalNum,
  e.inHospitalNum
FROM t_examination e
LEFT JOIN t_patient t ON e.patientID = t.patientID
WHERE
  TRY_CONVERT(date, e.examineDate) = TRY_CONVERT(date, ?)
  OR TRY_CONVERT(date, e.registerdate) = TRY_CONVERT(date, ?)
  OR TRY_CONVERT(date, e.reportDate) = TRY_CONVERT(date, ?)
ORDER BY e.examinationID DESC
"""
    with pyodbc.connect(conn_str, timeout=8) as conn:
        cur = conn.cursor()
        cur.execute(sql, (limit, date_text, date_text, date_text))
        rows = cur.fetchall()
        columns = [c[0] for c in cur.description]
    return columns, [tuple(r) for r in rows]


def query_with_pymssql(cfg: Dict[str, str], date_text: str, limit: int) -> Tuple[List[str], List[Tuple[Any, ...]]]:
    import pymssql  # type: ignore

    sql = """
SELECT TOP %s
  e.examinationID,
  e.examinationNum,
  e.examineDate,
  e.examineTime,
  e.registerdate,
  e.registertime,
  e.reportDate,
  e.reportTime,
  e.examinationStatus,
  e.examineType,
  e.examineParts,
  e.sentByDoctor,
  e.reportDoctorName,
  e.clinicalDiagnosis,
  e.majorTell,
  e.medicalRecords,
  t.patientID,
  t.patientNum,
  t.patientName,
  t.patientSex,
  t.patientAge,
  t.patientAgeUnit,
  t.patientTelephone,
  e.clinicalNum,
  e.inHospitalNum
FROM t_examination e
LEFT JOIN t_patient t ON e.patientID = t.patientID
WHERE
  TRY_CONVERT(date, e.examineDate) = TRY_CONVERT(date, %s)
  OR TRY_CONVERT(date, e.registerdate) = TRY_CONVERT(date, %s)
  OR TRY_CONVERT(date, e.reportDate) = TRY_CONVERT(date, %s)
ORDER BY e.examinationID DESC
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
        cur = conn.cursor()
        cur.execute(sql, (limit, date_text, date_text, date_text))
        rows = cur.fetchall()
        columns = [c[0] for c in cur.description]
    return columns, list(rows)


def to_rows(columns: Sequence[str], tuples_rows: Iterable[Tuple[Any, ...]]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for row in tuples_rows:
        item: Dict[str, Any] = {}
        for i, col in enumerate(columns):
            v = row[i]
            if isinstance(v, (dt.date, dt.datetime, dt.time)):
                item[col] = str(v)
            else:
                item[col] = v
        out.append(item)
    return out


def write_json(path: pathlib.Path, rows: List[Dict[str, Any]]) -> None:
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")


def write_csv(path: pathlib.Path, rows: List[Dict[str, Any]]) -> None:
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    fieldnames = list(rows[0].keys())
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser(description="按日期读取超声报告工作站病例信息并导出")
    parser.add_argument("--date", default=dt.date.today().isoformat(), help="日期，格式 YYYY-MM-DD，默认当天")
    parser.add_argument("--db-ini", default=str(DEFAULT_DB_INI), help="主数据库配置路径（相对项目根）")
    parser.add_argument("--db-ini-local", default=str(DEFAULT_DB_INI_LOCAL), help="备用数据库配置路径（相对项目根）")
    parser.add_argument("--out-dir", default=str(DEFAULT_OUT_DIR), help="输出目录，默认项目根下 exports")
    parser.add_argument("--limit", type=int, default=5000, help="最大条数，默认 5000")
    parser.add_argument("--host", default="", help="可选：覆盖 Host（用于临时切换数据库地址）")
    args = parser.parse_args()

    project_root = PROJECT_ROOT
    ini_candidates = [pathlib.Path(args.db_ini), pathlib.Path(args.db_ini_local)]
    resolved_inis: List[pathlib.Path] = []
    for p in ini_candidates:
        rp = p if p.is_absolute() else (project_root / p).resolve()
        if rp.exists():
            resolved_inis.append(rp)

    if not resolved_inis:
        print("[错误] 找不到可用数据库配置文件（DBconfig.ini / DBconfigLocal.ini）", file=sys.stderr)
        return 1

    columns: List[str] = []
    tuples_rows: List[Tuple[Any, ...]] = []
    used = ""
    used_ini = ""
    errors: List[str] = []

    for db_ini in resolved_inis:
        try:
            cfg = read_db_config(db_ini)
        except Exception as e:
            errors.append(f"{db_ini.name} 读取失败: {e}")
            continue

        if args.host.strip():
            cfg["host"] = args.host.strip()

        if not (cfg["host"] and cfg["user"] and cfg["db"]):
            errors.append(f"{db_ini.name} 缺少 Host/User/DB")
            continue

        local_errors: List[str] = []
        try:
            columns, tuples_rows = query_with_pyodbc(cfg, args.date, args.limit)
            used = "pyodbc"
            used_ini = str(db_ini)
            break
        except Exception as e:
            local_errors.append(f"pyodbc: {e}")

        try:
            columns, tuples_rows = query_with_pymssql(cfg, args.date, args.limit)
            used = "pymssql"
            used_ini = str(db_ini)
            break
        except Exception as e:
            local_errors.append(f"pymssql: {e}")

        errors.append(f"{db_ini.name} 连接失败 -> " + " | ".join(local_errors))

    if not columns and not tuples_rows:
        print("[错误] 连接/查询失败，请先安装驱动或库：", file=sys.stderr)
        print("  pip install pyodbc pymssql", file=sys.stderr)
        print("  （macOS 使用 pyodbc 还需安装 Microsoft ODBC Driver for SQL Server）", file=sys.stderr)
        for msg in errors:
            print("  - " + msg, file=sys.stderr)
        return 2

    rows = to_rows(columns, tuples_rows)
    out_dir = pathlib.Path(args.out_dir)
    if not out_dir.is_absolute():
        out_dir = (project_root / out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    stem = f"WS_CASES_{args.date}"
    json_path = out_dir / f"{stem}.json"
    csv_path = out_dir / f"{stem}.csv"
    write_json(json_path, rows)
    write_csv(csv_path, rows)

    print(f"[完成] 配置: {used_ini}")
    print(f"[完成] 数据源: {used}")
    print(f"[完成] 日期: {args.date}")
    print(f"[完成] 条数: {len(rows)}")
    print(f"[完成] JSON: {json_path}")
    print(f"[完成] CSV : {csv_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
