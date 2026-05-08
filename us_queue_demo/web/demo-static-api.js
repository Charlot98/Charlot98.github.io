/**
 * GitHub Pages / 纯静态托管：拦截对 localhost:18080 的代理 API，用 localStorage 模拟。
 * 激活条件：hostname 以 github.io 结尾、URL 含 ?demo=static、或 localStorage.queue_demo_force_static === "1"
 */
(function () {
  const LS_KEY = "queue_demo_static_store_v1";
  const BC_SYNC = "queue_demo_state_sync_v1";

  function isStaticDemoHost() {
    try {
      if (/\bdemo=static\b/i.test(location.search)) return true;
      if (localStorage.getItem("queue_demo_force_static") === "1") return true;
      if (/\.github\.io$/i.test(location.hostname)) return true;
    } catch (_) {}
    return false;
  }

  if (!isStaticDemoHost()) return;

  window.QUEUE_DEMO_STATIC_MODE = true;

  function notifySync() {
    try {
      const c = new BroadcastChannel(BC_SYNC);
      c.postMessage({ ts: Date.now() });
      c.close();
    } catch (_) {}
  }

  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    } catch (_) {
      return {};
    }
  }

  function saveAll(data) {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    notifySync();
  }

  function ensureScope(date, room) {
    const key = `${date}|${room}`;
    const all = loadAll();
    if (!all[key]) {
      all[key] = {
        caseStates: [],
        customRows: [],
        display: { abd_soon_limit: 3, heart_soon_limit: 2, updated_at: "" },
        nextCustomId: 1
      };
      localStorage.setItem(LS_KEY, JSON.stringify(all));
    }
    return { all, key, scope: all[key] };
  }

  function writeScope(all, key, scope) {
    all[key] = scope;
    saveAll(all);
  }

  function rowToApiCaseState(r) {
    return {
      case_key: r.case_key,
      is_shaved: !!r.is_shaved,
      status: r.status || "",
      updated_at: r.updated_at || "",
      start_check_time: r.start_check_time || ""
    };
  }

  function upsertCaseState(scope, payload) {
    const ck = String(payload.case_key || "");
    const nx = {
      case_key: ck,
      is_shaved: !!payload.is_shaved,
      status: String(payload.status || ""),
      start_check_time: String(payload.start_check_time || ""),
      updated_at: new Date().toISOString()
    };
    const i = scope.caseStates.findIndex((x) => x.case_key === ck);
    if (i >= 0) scope.caseStates[i] = { ...scope.caseStates[i], ...nx };
    else scope.caseStates.push(nx);
  }

  const orig = window.fetch.bind(window);

  function isDemoApiUrl(urlStr) {
    try {
      const u = new URL(urlStr, location.href);
      if (u.port !== "18080") return false;
      const p = u.pathname || "";
      return ["/case_states", "/case_state", "/custom_rows", "/display_settings"].some(
        (x) => p === x || p.endsWith(x)
      );
    } catch (_) {
      return false;
    }
  }

  function jsonResponse(obj, status) {
    return new Response(JSON.stringify(obj), {
      status: status || 200,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  async function readBody(input, init) {
    if (input instanceof Request && input.method !== "GET" && input.method !== "HEAD") {
      return input.clone().text();
    }
    if (init && init.body != null) {
      if (typeof init.body === "string") return init.body;
      try {
        return await new Response(init.body).text();
      } catch (_) {
        return "";
      }
    }
    return "";
  }

  window.fetch = async function (input, init) {
    const urlStr = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
    if (!isDemoApiUrl(urlStr)) {
      return orig(input, init);
    }

    const u = new URL(urlStr);
    const path = u.pathname || "";
    const qs = u.searchParams;
    const qDate = qs.get("date") || "";
    const qRoom = qs.get("room") || "";

    const method = input instanceof Request ? input.method : (init && init.method) || "GET";
    const bodyText = await readBody(input, init);

    const fail = (msg, code) => jsonResponse({ ok: false, error: msg }, code || 400);

    if (path.endsWith("/case_states") && method === "GET") {
      if (!qDate || !qRoom) return fail("date 和 room 必填");
      const { scope } = ensureScope(qDate, qRoom);
      const rows = scope.caseStates.map(rowToApiCaseState);
      return jsonResponse({ ok: true, rows, count: rows.length });
    }

    if (path.endsWith("/case_state") && method === "POST") {
      let payload = {};
      try {
        payload = JSON.parse(bodyText || "{}");
      } catch (_) {}
      const d = String(payload.date || "").trim();
      const r = String(payload.room || "").trim();
      const ck = String(payload.case_key || "").trim();
      if (!d || !r || !ck) return fail("date / room / case_key 必填");
      const { all, key, scope } = ensureScope(d, r);
      upsertCaseState(scope, payload);
      writeScope(all, key, scope);
      return jsonResponse({ ok: true });
    }

    if (path.endsWith("/display_settings") && method === "GET") {
      if (!qDate || !qRoom) return fail("date 和 room 必填");
      const { scope } = ensureScope(qDate, qRoom);
      return jsonResponse({ ok: true, ...scope.display });
    }

    if (path.endsWith("/display_settings") && method === "POST") {
      let payload = {};
      try {
        payload = JSON.parse(bodyText || "{}");
      } catch (_) {}
      const d = String(payload.date || "").trim();
      const rm = String(payload.room || "").trim();
      if (!d || !rm) return fail("date 和 room 必填");
      const { all, key, scope } = ensureScope(d, rm);
      const abdRaw = payload.abd_soon_limit != null ? payload.abd_soon_limit : scope.display.abd_soon_limit;
      const heartRaw = payload.heart_soon_limit != null ? payload.heart_soon_limit : scope.display.heart_soon_limit;
      const abd = Math.max(0, Math.min(30, parseInt(String(abdRaw), 10) || 3));
      const heart = Math.max(0, Math.min(30, parseInt(String(heartRaw), 10) || 2));
      scope.display = { abd_soon_limit: abd, heart_soon_limit: heart, updated_at: new Date().toISOString() };
      writeScope(all, key, scope);
      return jsonResponse({ ok: true, ...scope.display });
    }

    if (path.endsWith("/custom_rows") && method === "GET") {
      if (!qDate || !qRoom) return fail("date 和 room 必填");
      const { scope } = ensureScope(qDate, qRoom);
      const rows = scope.customRows.map((row) => ({
        id: row.id,
        case_key: row.case_key,
        kind: row.kind,
        kind_group: row.kind,
        xh: row.xh,
        name: row.name,
        pat_name: row.pat_name || "-",
        item_name: row.item_name || row.kind || "",
        rh_status: row.rh_status || "1",
        signtime: row.signtime || "",
        queue_bucket: "custom",
        callingroom: row.callingroom || qRoom
      }));
      return jsonResponse({ ok: true, rows, count: rows.length });
    }

    if (path.endsWith("/custom_rows") && method === "DELETE") {
      if (!qDate || !qRoom) return fail("date 和 room 必填");
      const rowId = qs.get("id");
      const { all, key, scope } = ensureScope(qDate, qRoom);
      if (rowId) {
        const idn = parseInt(rowId, 10);
        const before = scope.customRows.length;
        scope.customRows = scope.customRows.filter((x) => x.id !== idn);
        writeScope(all, key, scope);
        return jsonResponse({ ok: true, deleted: before - scope.customRows.length, mode: "single" });
      }
      const deleted = scope.customRows.length;
      scope.customRows = [];
      writeScope(all, key, scope);
      return jsonResponse({ ok: true, deleted, mode: "all" });
    }

    if (path.endsWith("/custom_rows") && method === "POST") {
      let payload = {};
      try {
        payload = JSON.parse(bodyText || "{}");
      } catch (_) {}
      const d = String(payload.date || "").trim();
      const rm = String(payload.room || "").trim();
      if (!d || !rm) return fail("date 和 room 必填");
      const { all, key, scope } = ensureScope(d, rm);

      if (String(payload.id || "").trim()) {
        const idn = parseInt(String(payload.id), 10);
        const row = scope.customRows.find((x) => x.id === idn);
        if (!row) return jsonResponse({ ok: true, updated: 0 });
        row.item_name = String(payload.item_name || "");
        writeScope(all, key, scope);
        return jsonResponse({ ok: true, updated: 1 });
      }

      const kind = String(payload.kind || "").trim();
      const xh = String(payload.xh || "").trim();
      const name = String(payload.name || "").trim();
      if (!kind || !xh || !name) return fail("kind / xh / name 必填");
      const pat_name = String(payload.pat_name || "-").trim() || "-";
      const id = scope.nextCustomId++;
      const case_key = `tmp:${xh}-${name}-${pat_name}`;
      scope.customRows.push({
        id,
        kind,
        xh,
        name,
        pat_name,
        item_name: String(payload.item_name || kind || ""),
        rh_status: String(payload.rh_status || "1"),
        signtime: String(payload.signtime || ""),
        callingroom: String(payload.callingroom || rm),
        case_key
      });
      writeScope(all, key, scope);
      return jsonResponse({ ok: true, id });
    }

    return fail("Not Found", 404);
  };
})();
