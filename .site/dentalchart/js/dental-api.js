(function (global) {
    'use strict';

    const TOKEN_KEY = 'dentalchart:device-token:v1';
    const TOKEN_META_KEY = 'dentalchart:device-token-meta:v1';
    const LEGACY_PASSWORD_KEY = 'dentalchart:access-password:v1';
    const nativeFetch = global.fetch.bind(global);
    let promptPromise = null;

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

    function saveToken(token, meta) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(TOKEN_META_KEY, JSON.stringify(meta || {}));
        sessionStorage.removeItem(LEGACY_PASSWORD_KEY);
    }

    function clearToken() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_META_KEY);
        sessionStorage.removeItem(LEGACY_PASSWORD_KEY);
    }

    function deviceName() {
        return String(global.navigator?.userAgent || 'browser').slice(0, 100);
    }

    async function requestPairingPassword() {
        if (promptPromise) return promptPromise;
        promptPromise = Promise.resolve().then(() => {
            const value = global.prompt('首次使用请输入 DentalChart 配对密码');
            const password = String(value || '').trim();
            if (!password) throw new Error('已取消设备配对');
            return password;
        }).finally(() => {
            promptPromise = null;
        });
        return promptPromise;
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
            throw new Error(payload.message || '设备配对失败');
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

    async function ensureAccess() {
        const existing = readToken();
        if (existing) return existing;
        const password = await requestPairingPassword();
        return pairDevice(password);
    }

    async function apiFetch(resource, options = {}, retry = true) {
        const headers = new Headers(options.headers || {});
        headers.set('X-Dental-Device-Token', await ensureAccess());
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
            clearToken();
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
        clearAccess: clearToken,
        logout,
        endpoint: apiUrl,
    };
})(window);
