(function (global) {
  'use strict';

  const TOKEN_KEY = 'schedule:device-token:v1';
  const TOKEN_META_KEY = 'schedule:device-token-meta:v1';
  const DENTAL_TOKEN_KEY = 'dentalchart:device-token:v1';
  const nativeFetch = global.fetch.bind(global);
  let pairingPromise = null;

  function config() {
    const value = global.SCHEDULE_CONFIG || {};
    const apiUrl = String(value.apiUrl || '').replace(/\/+$/, '');
    if (!/^https:\/\/.+\/functions\/v1\/schedule-api$/i.test(apiUrl)) {
      throw new Error('请先配置排班 Supabase Edge Function 地址');
    }
    return { apiUrl };
  }

  function apiUrl(resource) {
    const text = String(resource || '');
    if (/^https?:\/\//i.test(text)) return text;
    const relative = text.replace(/^\.?\//, '').replace(/^api\/?/, '');
    return `${config().apiUrl}/${relative}`;
  }

  function readToken() {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(DENTAL_TOKEN_KEY) || '';
  }

  function saveToken(token, meta) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_META_KEY, JSON.stringify(meta || {}));
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_META_KEY);
  }

  function deviceName() {
    return String(global.navigator?.userAgent || 'schedule-browser').slice(0, 100);
  }

  function requestPairingCredentials() {
    return new Promise((resolve, reject) => {
      const overlay = document.createElement('div');
      overlay.className = 'schedule-auth-overlay';

      const panel = document.createElement('section');
      panel.className = 'schedule-auth-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-labelledby', 'scheduleAuthTitle');

      const title = document.createElement('h2');
      title.id = 'scheduleAuthTitle';
      title.textContent = '管理员登录';

      const eyebrow = document.createElement('p');
      eyebrow.className = 'schedule-auth-kicker';
      eyebrow.textContent = '科室排班';

      const form = document.createElement('form');
      form.className = 'schedule-auth-form';

      const usernameLabel = document.createElement('label');
      usernameLabel.textContent = '账号名';
      usernameLabel.htmlFor = 'scheduleAuthUsername';
      const username = document.createElement('input');
      username.id = 'scheduleAuthUsername';
      username.type = 'text';
      username.autocomplete = 'username';
      username.setAttribute('aria-label', '账号名');

      const passwordLabel = document.createElement('label');
      passwordLabel.textContent = '密码';
      passwordLabel.htmlFor = 'scheduleAuthPassword';
      const password = document.createElement('input');
      password.id = 'scheduleAuthPassword';
      password.type = 'password';
      password.autocomplete = 'current-password';
      password.setAttribute('aria-label', '密码');

      const error = document.createElement('p');
      error.className = 'schedule-auth-error';
      error.setAttribute('aria-live', 'polite');

      const confirm = document.createElement('button');
      confirm.type = 'submit';
      confirm.className = 'primary';
      confirm.textContent = '登录';
      const guest = document.createElement('button');
      guest.type = 'button';
      guest.className = 'schedule-auth-guest';
      guest.textContent = '游客登录';
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.textContent = '取消';

      form.append(usernameLabel, username, passwordLabel, password, error, confirm, guest, cancel);
      panel.append(eyebrow, title, form);
      overlay.appendChild(panel);

      const cleanup = () => {
        document.removeEventListener('keydown', handleKeydown);
        document.body.classList.remove('schedule-auth-open');
        overlay.remove();
      };
      const cancelPairing = () => {
        cleanup();
        reject(new Error('已取消设备配对'));
      };
      const continueAsGuest = () => {
        cleanup();
        const guestError = new Error('游客登录');
        guestError.guest = true;
        reject(guestError);
      };
      const handleKeydown = (event) => {
        if (event.key === 'Escape') cancelPairing();
      };

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const account = username.value.trim().toLowerCase();
        const secret = password.value.trim();
        if (!account || !secret) {
          error.textContent = '请输入账号名和密码';
          (account ? password : username).focus();
          return;
        }
        cleanup();
        resolve({ username: account, password: secret });
      });
      cancel.addEventListener('click', cancelPairing);
      guest.addEventListener('click', continueAsGuest);
      document.addEventListener('keydown', handleKeydown);
      document.body.classList.add('schedule-auth-open');
      document.body.appendChild(overlay);
      username.focus();
    });
  }

  function currentAccount() {
    try {
      return String(JSON.parse(localStorage.getItem(TOKEN_META_KEY) || '{}').account || '');
    } catch {
      return '';
    }
  }

  async function pairDevice(credentials) {
    const response = await nativeFetch(apiUrl('pair'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'omit',
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
        deviceName: deviceName(),
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || '设备配对失败');
    }
    const token = String(payload.token || '').trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(token)) {
      throw new Error('服务返回的设备令牌无效');
    }
    saveToken(token, {
      tokenId: payload.tokenId || '',
      expiresAt: payload.expiresAt || '',
      account: payload.account || credentials.username || '',
    });
    return token;
  }

  async function ensureAccess(forcePair = false) {
    const existing = forcePair ? '' : readToken();
    if (existing) return existing;
    if (!pairingPromise) {
      pairingPromise = Promise.resolve()
        .then(requestPairingCredentials)
        .then(pairDevice)
        .finally(() => {
          pairingPromise = null;
        });
    }
    return pairingPromise;
  }

  async function apiFetch(resource, options = {}, retry = true) {
    const headers = new Headers(options.headers || {});
    const requestToken = await ensureAccess();
    headers.set('X-Dental-Device-Token', requestToken);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');

    let response;
    try {
      response = await nativeFetch(apiUrl(resource), {
        ...options,
        headers,
        credentials: 'omit',
      });
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      throw new Error('无法连接排班云端服务');
    }

    if (response.status === 401 && retry) {
      clearToken();
      await ensureAccess(true);
      return apiFetch(resource, options, false);
    }
    return response;
  }

  async function readJson(response, fallbackMessage) {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.message || fallbackMessage);
      error.status = response.status;
      error.version = payload.version;
      throw error;
    }
    return payload;
  }

  async function publicFetch(resource) {
    let response;
    try {
      response = await nativeFetch(apiUrl(resource), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'omit',
      });
    } catch {
      throw new Error('无法连接排班云端服务');
    }
    return response;
  }

  async function checkSession() {
    const token = readToken();
    if (!token) return { authenticated: false };
    try {
      const response = await nativeFetch(apiUrl('session'), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Dental-Device-Token': token,
        },
        credentials: 'omit',
      });
      if (response.status === 401) return { authenticated: false };
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return { authenticated: false };
      if (payload.account) {
        const meta = JSON.parse(localStorage.getItem(TOKEN_META_KEY) || '{}');
        saveToken(token, { ...meta, account: payload.account, expiresAt: payload.expiresAt || meta.expiresAt || '' });
      }
      return { authenticated: true, expiresAt: payload.expiresAt || '', account: payload.account || currentAccount() };
    } catch {
      return { authenticated: false };
    }
  }

  async function listVersions() {
    const response = await publicFetch('versions');
    return readJson(response, '读取云端排班版本失败');
  }

  async function getVersion(id) {
    const response = await publicFetch(`versions/${encodeURIComponent(id)}`);
    return readJson(response, '读取云端排班详情失败');
  }

  async function createVersion(payload) {
    const response = await apiFetch('versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload }),
    });
    return readJson(response, '保存云端排班失败');
  }

  async function updateVersion(id, payload, baseRevision) {
    const response = await apiFetch(`versions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload,
        ...(Number.isInteger(baseRevision) ? { baseRevision } : {}),
      }),
    });
    return readJson(response, '更新云端排班失败');
  }

  function liveQuery(id, annotationKey) {
    const query = annotationKey ? `?annotationKey=${encodeURIComponent(annotationKey)}` : '';
    return `versions/${encodeURIComponent(id)}/live${query}`;
  }

  async function liveStatus(id, annotationKey) {
    const response = await publicFetch(liveQuery(id, annotationKey));
    return readJson(response, '读取实时编辑状态失败');
  }

  async function touchLive(id, annotationKey) {
    const response = await apiFetch(liveQuery(id, annotationKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    return readJson(response, '更新实时编辑状态失败');
  }

  async function getAnnotations(versionKey) {
    const response = await publicFetch(`annotations/${encodeURIComponent(versionKey)}`);
    return readJson(response, '读取云端热力图标注失败');
  }

  async function saveAnnotations(versionKey, periodKey, preferences) {
    const response = await apiFetch(`annotations/${encodeURIComponent(versionKey)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodKey, preferences }),
    });
    return readJson(response, '保存云端热力图标注失败');
  }

  global.ScheduleApi = {
    fetch: apiFetch,
    ensureAccess,
    clearAccess: clearToken,
    checkSession,
    listVersions,
    getVersion,
    createVersion,
    updateVersion,
    liveStatus,
    touchLive,
    getAnnotations,
    saveAnnotations,
    endpoint: apiUrl,
    hasToken: () => Boolean(readToken()),
    currentAccount,
  };
})(window);
