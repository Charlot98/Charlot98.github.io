#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sqlite3
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

_SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = _SCRIPT_DIR.parent
DB_PATH = PROJECT_ROOT / "data" / "queue_base.db"


def build_case_key(row: dict) -> str:
    patient_id = str((row or {}).get("patient_id", "")).strip()
    if patient_id:
        return f"pid:{patient_id}"
    serial_no = str((row or {}).get("serial_no", "")).strip()
    if serial_no:
        return f"sn:{serial_no}"
    xh = str((row or {}).get("xh", "")).strip()
    name = str((row or {}).get("name", "")).strip()
    pat_name = str((row or {}).get("pat_name", "")).strip()
    return f"tmp:{xh}-{name}-{pat_name}"


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS custom_queue_rows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                biz_date TEXT NOT NULL,
                room TEXT NOT NULL,
                kind TEXT NOT NULL,
                xh TEXT NOT NULL,
                name TEXT NOT NULL,
                pat_name TEXT,
                item_name TEXT,
                rh_status TEXT DEFAULT '1',
                signtime TEXT,
                callingroom TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS case_states (
                biz_date TEXT NOT NULL,
                room TEXT NOT NULL,
                case_key TEXT NOT NULL,
                is_shaved INTEGER DEFAULT 0,
                status TEXT DEFAULT '',
                start_check_time TEXT DEFAULT '',
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (biz_date, room, case_key)
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS queue_display_settings (
                biz_date TEXT NOT NULL,
                room TEXT NOT NULL,
                abd_soon_limit INTEGER DEFAULT 3,
                heart_soon_limit INTEGER DEFAULT 2,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (biz_date, room)
            )
            """
        )
        cols = [r[1] for r in conn.execute("PRAGMA table_info(case_states)").fetchall()]
        if "start_check_time" not in cols:
            conn.execute("ALTER TABLE case_states ADD COLUMN start_check_time TEXT DEFAULT ''")
        custom_cols = [r[1] for r in conn.execute("PRAGMA table_info(custom_queue_rows)").fetchall()]
        if "item_name" not in custom_cols:
            conn.execute("ALTER TABLE custom_queue_rows ADD COLUMN item_name TEXT DEFAULT ''")
        conn.commit()
    finally:
        conn.close()


def db_insert_custom_row(payload: dict) -> int:
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.execute(
            """
            INSERT INTO custom_queue_rows
            (biz_date, room, kind, xh, name, pat_name, item_name, rh_status, signtime, callingroom)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                str(payload.get("date", "")),
                str(payload.get("room", "")),
                str(payload.get("kind", "")),
                str(payload.get("xh", "")),
                str(payload.get("name", "")),
                str(payload.get("pat_name", "")),
                str(payload.get("item_name", payload.get("kind", ""))),
                str(payload.get("rh_status", "1")),
                str(payload.get("signtime", "")),
                str(payload.get("callingroom", "")),
            ),
        )
        conn.commit()
        return int(cur.lastrowid)
    finally:
        conn.close()


def db_list_custom_rows(date: str, room: str) -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        cur = conn.execute(
            """
            SELECT id, biz_date, room, kind, xh, name, pat_name, item_name, rh_status, signtime, callingroom
            FROM custom_queue_rows
            WHERE biz_date = ? AND room = ?
            ORDER BY CAST(xh AS INTEGER) ASC, id ASC
            """,
            (date, room),
        )
        rows = []
        for r in cur.fetchall():
            rows.append(
                {
                    "id": r["id"],
                    "case_key": build_case_key({"xh": r["xh"], "name": r["name"], "pat_name": r["pat_name"]}),
                    "kind": r["kind"],
                    "kind_group": r["kind"],
                    "xh": r["xh"],
                    "name": r["name"],
                    "pat_name": r["pat_name"] or "-",
                    "item_name": r["item_name"] or r["kind"] or "",
                    "rh_status": r["rh_status"] or "1",
                    "signtime": r["signtime"] or "",
                    "queue_bucket": "custom",
                    "callingroom": r["callingroom"] or room,
                }
            )
        return rows
    finally:
        conn.close()


def db_upsert_case_state(payload: dict) -> None:
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            """
            INSERT INTO case_states (biz_date, room, case_key, is_shaved, status, start_check_time, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(biz_date, room, case_key)
            DO UPDATE SET
              is_shaved = excluded.is_shaved,
              status = excluded.status,
              start_check_time = excluded.start_check_time,
              updated_at = CURRENT_TIMESTAMP
            """,
            (
                str(payload.get("date", "")),
                str(payload.get("room", "")),
                str(payload.get("case_key", "")),
                1 if bool(payload.get("is_shaved", False)) else 0,
                str(payload.get("status", "")),
                str(payload.get("start_check_time", "")),
            ),
        )
        conn.commit()
    finally:
        conn.close()


def db_list_case_states(date: str, room: str) -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        cur = conn.execute(
            """
            SELECT case_key, is_shaved, status, updated_at
                 , start_check_time
            FROM case_states
            WHERE biz_date = ? AND room = ?
            """,
            (date, room),
        )
        return [
            {
                "case_key": r["case_key"],
                "is_shaved": bool(r["is_shaved"]),
                "status": r["status"] or "",
                "updated_at": r["updated_at"] or "",
                "start_check_time": r["start_check_time"] or "",
            }
            for r in cur.fetchall()
        ]
    finally:
        conn.close()


def db_clear_custom_rows(date: str, room: str) -> int:
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.execute(
            "DELETE FROM custom_queue_rows WHERE biz_date = ? AND room = ?",
            (date, room),
        )
        conn.commit()
        return int(cur.rowcount)
    finally:
        conn.close()


def db_delete_custom_row(date: str, room: str, row_id: int) -> int:
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.execute(
            "DELETE FROM custom_queue_rows WHERE biz_date = ? AND room = ? AND id = ?",
            (date, room, int(row_id)),
        )
        conn.commit()
        return int(cur.rowcount)
    finally:
        conn.close()


def db_update_custom_row_item(date: str, room: str, row_id: int, item_name: str) -> int:
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.execute(
            "UPDATE custom_queue_rows SET item_name = ? WHERE biz_date = ? AND room = ? AND id = ?",
            (str(item_name), date, room, int(row_id)),
        )
        conn.commit()
        return int(cur.rowcount)
    finally:
        conn.close()


def db_get_display_settings(date: str, room: str) -> dict:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        row = conn.execute(
            """
            SELECT abd_soon_limit, heart_soon_limit, updated_at
            FROM queue_display_settings
            WHERE biz_date = ? AND room = ?
            """,
            (date, room),
        ).fetchone()
        if not row:
            return {"abd_soon_limit": 3, "heart_soon_limit": 2, "updated_at": ""}
        return {
            "abd_soon_limit": int(row["abd_soon_limit"] if row["abd_soon_limit"] is not None else 3),
            "heart_soon_limit": int(row["heart_soon_limit"] if row["heart_soon_limit"] is not None else 2),
            "updated_at": row["updated_at"] or "",
        }
    finally:
        conn.close()


def db_upsert_display_settings(payload: dict) -> None:
    date = str(payload.get("date", "")).strip()
    room = str(payload.get("room", "")).strip()
    abd_soon_limit = int(payload.get("abd_soon_limit", 3))
    heart_soon_limit = int(payload.get("heart_soon_limit", 2))
    abd_soon_limit = max(0, min(30, abd_soon_limit))
    heart_soon_limit = max(0, min(30, heart_soon_limit))
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            """
            INSERT INTO queue_display_settings
                (biz_date, room, abd_soon_limit, heart_soon_limit, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(biz_date, room)
            DO UPDATE SET
              abd_soon_limit = excluded.abd_soon_limit,
              heart_soon_limit = excluded.heart_soon_limit,
              updated_at = CURRENT_TIMESTAMP
            """,
            (date, room, abd_soon_limit, heart_soon_limit),
        )
        conn.commit()
    finally:
        conn.close()


def post_action(base_url: str, token: str, action: str, payload: dict) -> dict:
    query = urllib.parse.urlencode({"action": action, "token": token})
    url = f"{base_url}?{query}"
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        url=url,
        data=body,
        method="POST",
        headers={"Content-Type": "application/json;charset=UTF-8"},
    )
    with urllib.request.urlopen(req, timeout=8) as resp:
        raw = resp.read().decode("utf-8", errors="replace")
    return json.loads(raw)


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, data: dict) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self._send(200, {"ok": True})

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path not in ("/custom_rows", "/case_states", "/display_settings"):
            self._send(404, {"ok": False, "error": "Not Found"})
            return
        query = urllib.parse.parse_qs(parsed.query or "")
        date = (query.get("date") or [""])[0]
        room = (query.get("room") or [""])[0]
        if not date or not room:
            self._send(400, {"ok": False, "error": "date 和 room 必填"})
            return
        if parsed.path == "/custom_rows":
            rows = db_list_custom_rows(date, room)
            self._send(200, {"ok": True, "rows": rows, "count": len(rows)})
            return
        if parsed.path == "/display_settings":
            settings = db_get_display_settings(date, room)
            self._send(200, {"ok": True, **settings})
            return
        states = db_list_case_states(date, room)
        self._send(200, {"ok": True, "rows": states, "count": len(states)})

    def do_DELETE(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != "/custom_rows":
            self._send(404, {"ok": False, "error": "Not Found"})
            return
        query = urllib.parse.parse_qs(parsed.query or "")
        date = (query.get("date") or [""])[0]
        room = (query.get("room") or [""])[0]
        if not date or not room:
            self._send(400, {"ok": False, "error": "date 和 room 必填"})
            return
        row_id = (query.get("id") or [""])[0]
        if row_id:
            try:
                deleted = db_delete_custom_row(date, room, int(row_id))
            except Exception:
                self._send(400, {"ok": False, "error": "id 非法"})
                return
            self._send(200, {"ok": True, "deleted": deleted, "mode": "single"})
            return
        deleted = db_clear_custom_rows(date, room)
        self._send(200, {"ok": True, "deleted": deleted, "mode": "all"})

    def do_POST(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path not in ("/call", "/custom_rows", "/case_state", "/display_settings"):
            self._send(404, {"ok": False, "error": "Not Found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            if parsed.path == "/display_settings":
                required = ("date", "room")
                for key in required:
                    if not str(payload.get(key, "")).strip():
                        self._send(400, {"ok": False, "error": f"{key} 必填"})
                        return
                try:
                    db_upsert_display_settings(payload)
                except Exception:
                    self._send(400, {"ok": False, "error": "display_settings 参数非法"})
                    return
                settings = db_get_display_settings(str(payload.get("date", "")), str(payload.get("room", "")))
                self._send(200, {"ok": True, **settings})
                return
            if parsed.path == "/case_state":
                required = ("date", "room", "case_key")
                for key in required:
                    if not str(payload.get(key, "")).strip():
                        self._send(400, {"ok": False, "error": f"{key} 必填"})
                        return
                db_upsert_case_state(payload)
                self._send(200, {"ok": True})
                return
            if parsed.path == "/custom_rows":
                if str(payload.get("id", "")).strip():
                    if not str(payload.get("date", "")).strip() or not str(payload.get("room", "")).strip():
                        self._send(400, {"ok": False, "error": "date 和 room 必填"})
                        return
                    try:
                        updated = db_update_custom_row_item(
                            str(payload.get("date", "")),
                            str(payload.get("room", "")),
                            int(payload.get("id")),
                            str(payload.get("item_name", "")),
                        )
                    except Exception:
                        self._send(400, {"ok": False, "error": "更新参数非法"})
                        return
                    self._send(200, {"ok": True, "updated": updated})
                    return
                required = ("date", "room", "kind", "xh", "name")
                for key in required:
                    if not str(payload.get(key, "")).strip():
                        self._send(400, {"ok": False, "error": f"{key} 必填"})
                        return
                row_id = db_insert_custom_row(payload)
                self._send(200, {"ok": True, "id": row_id})
                return

            host = payload.get("callingHost", "10.10.8.204")
            port = str(payload.get("callingPort", "13003"))
            token = payload.get("token", "ytsoftwareCNAMU")
            action = payload.get("action", "RH_CallNumber")
            item = payload.get("item", {}) or {}
            date = payload.get("date", "")
            room = payload.get("room", "")

            base_url = f"http://{host}:{port}/CNAMURegister.ashx"
            candidates = [
                {"date": date, "room": room, "xh": item.get("xh")},
                {"date": date, "room": room, "serial_no": item.get("serial_no")},
                {"xh": item.get("xh"), "serial_no": item.get("serial_no")},
                {"patient_id": item.get("patient_id"), "date": date, "room": room},
            ]
            last = {}
            for c in candidates:
                clean = {k: v for k, v in c.items() if v not in ("", None)}
                if not clean:
                    continue
                try:
                    resp = post_action(base_url, token, action, clean)
                except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError) as e:
                    last = {"ok": False, "error": str(e), "payload": clean}
                    continue
                last = {"ok": resp.get("code") == 0, "msg": resp.get("msg", ""), "resp": resp, "payload": clean}
                if resp.get("code") == 0:
                    self._send(200, last)
                    return
            self._send(502, last or {"ok": False, "error": "No valid payload"})
        except Exception as e:
            self._send(500, {"ok": False, "error": str(e)})


def main() -> None:
    init_db()
    server = ThreadingHTTPServer(("0.0.0.0", 18080), Handler)
    print("call_number_proxy running at http://0.0.0.0:18080")
    server.serve_forever()


if __name__ == "__main__":
    main()
