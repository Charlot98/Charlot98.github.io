(function (global) {
    'use strict';

    const TOKEN_KEY = 'dentalchart:device-token:v1';
    const TOKEN_META_KEY = 'dentalchart:device-token-meta:v1';
    const LEGACY_PASSWORD_KEY = 'dentalchart:access-password:v1';
    const nativeFetch = global.fetch.bind(global);
    let pairingPromise = null;

    function config() {
        const value = global.DENTALCHART_CONFIG || {};
        const apiUrl = String(value.apiUrl || '').replace(/\/+$/, '');
        if (!/^https:\/\/.+\/functions\/v1\/dentalchart-api$/i.test(apiUrl)) {
            throw new Error('请先配置 Supabase Edge Function 地址');
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
        return localStorage.getItem(TOKEN_KEY) || '';
    }

    // 请求浏览器把本站存储标记为持久，避免内存紧张时被自动清理；
    // 若用户设置了“退出浏览器时清除站点数据”，则不受此影响。
    function requestPersistentStorage() {
        try {
            global.navigator?.storage?.persist?.().catch(() => {});
        } catch (_) {
            // 浏览器不支持时忽略。
        }
    }

    function saveToken(token, meta) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(TOKEN_META_KEY, JSON.stringify(meta || {}));
        sessionStorage.removeItem(LEGACY_PASSWORD_KEY);
        requestPersistentStorage();
    }

    function clearToken() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_META_KEY);
        sessionStorage.removeItem(LEGACY_PASSWORD_KEY);
    }

    // 清理上一版曾写入的明文密码。
    try { localStorage.removeItem(LEGACY_PASSWORD_KEY); } catch (_) {}
    if (readToken()) requestPersistentStorage();

    function deviceName() {
        return String(global.navigator?.userAgent || 'browser').slice(0, 100);
    }

    // 弹出密码框并在框内完成配对：密码错误时保留弹窗并提示，不会关闭后再次弹出。
    // 其他标签页完成配对后（令牌写入 localStorage），本弹窗会自动关闭并复用该令牌。
    function requestPairingPassword(pair) {
        return new Promise((resolve, reject) => {
            const overlay = document.createElement('div');
            overlay.className = 'dental-auth-overlay';

            const panel = document.createElement('section');
            panel.className = 'dental-auth-panel';
            panel.setAttribute('role', 'dialog');
            panel.setAttribute('aria-modal', 'true');
            panel.setAttribute('aria-labelledby', 'dentalAuthTitle');

            const title = document.createElement('h2');
            title.id = 'dentalAuthTitle';
            title.textContent = '请输入密码';

            const form = document.createElement('form');
            form.className = 'dental-auth-form';

            const input = document.createElement('input');
            input.type = 'password';
            input.autocomplete = 'current-password';
            input.setAttribute('aria-label', '密码');

            const hint = document.createElement('p');
            hint.className = 'dental-auth-hint';
            hint.textContent = '提示：c*****';

            const error = document.createElement('p');
            error.className = 'dental-auth-error';
            error.setAttribute('aria-live', 'polite');

            const actions = document.createElement('div');
            actions.className = 'dental-auth-actions';
            const cancel = document.createElement('button');
            cancel.type = 'button';
            cancel.textContent = '取消';
            const confirm = document.createElement('button');
            confirm.type = 'submit';
            confirm.className = 'primary';
            confirm.textContent = '确认';
            actions.append(cancel, confirm);
            form.append(input, hint, error, actions);
            panel.append(title, form);
            overlay.appendChild(panel);

            let busy = false;
            const cleanup = () => {
                document.removeEventListener('keydown', handleKeydown);
                global.removeEventListener('storage', handleStorage);
                document.body.classList.remove('dental-auth-open');
                overlay.remove();
            };
            const cancelPairing = () => {
                if (busy) return;
                cleanup();
                reject(new Error('已取消设备配对'));
            };
            const handleKeydown = (event) => {
                if (event.key === 'Escape') cancelPairing();
            };
            const handleStorage = (event) => {
                if (event.key !== TOKEN_KEY || !event.newValue) return;
                cleanup();
                resolve(event.newValue);
            };

            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                if (busy) return;
                const password = input.value.trim();
                if (!password) {
                    error.textContent = '请输入密码';
                    input.focus();
                    return;
                }
                busy = true;
                error.textContent = '';
                input.disabled = true;
                confirm.disabled = true;
                confirm.textContent = '验证中...';
                try {
                    const token = await pair(password);
                    cleanup();
                    resolve(token);
                } catch (pairError) {
                    busy = false;
                    input.disabled = false;
                    confirm.disabled = false;
                    confirm.textContent = '确认';
                    error.textContent = pairError?.status === 401
                        ? '密码错误，请重试'
                        : (pairError?.message || '登录失败，请重试');
                    input.select();
                    input.focus();
                }
            });
            cancel.addEventListener('click', cancelPairing);
            document.addEventListener('keydown', handleKeydown);
            global.addEventListener('storage', handleStorage);
            document.body.classList.add('dental-auth-open');
            document.body.appendChild(overlay);
            input.focus();
        });
    }

    async function pairDevice(password) {
        const response = await nativeFetch(apiUrl('pair'), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'omit',
            body: JSON.stringify({
                password,
                deviceName: deviceName(),
            }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(payload.message || '设备配对失败');
            error.status = response.status;
            throw error;
        }
        const token = String(payload.token || '').trim().toLowerCase();
        if (!/^[a-f0-9]{64}$/.test(token)) {
            throw new Error('服务返回的设备令牌无效');
        }
        saveToken(token, {
            tokenId: payload.tokenId || '',
            expiresAt: payload.expiresAt || '',
        });
        return token;
    }

    // prompt: false 时仅检查是否已登录，不弹出密码框（用于后台轮询）。
    async function ensureAccess({ prompt = true } = {}) {
        const existing = readToken();
        if (existing) return existing;
        if (!prompt) throw new Error('尚未登录');
        if (!pairingPromise) {
            pairingPromise = requestPairingPassword(pairDevice).finally(() => {
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
            throw new Error('无法连接 Supabase 牙表服务');
        }

        if (response.status === 401 && retry) {
            if (readToken() === requestToken) clearToken();
            await ensureAccess();
            return apiFetch(resource, options, false);
        }
        return response;
    }

    async function logout() {
        const token = readToken();
        if (!token) return;
        try {
            await nativeFetch(apiUrl('logout'), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Dental-Device-Token': token,
                },
                credentials: 'omit',
            });
        } finally {
            clearToken();
        }
    }

    global.DentalApi = {
        fetch: apiFetch,
        ensureAccess,
        hasToken: () => Boolean(readToken()),
        clearAccess: clearToken,
        logout,
        endpoint: apiUrl,
    };
})(window);
