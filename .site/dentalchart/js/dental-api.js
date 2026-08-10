(function (global) {
    'use strict';

    const ACCESS_KEY = 'dentalchart:access-password:v1';
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

    function readPassword() {
        return sessionStorage.getItem(ACCESS_KEY) || '';
    }

    async function requestPassword() {
        if (promptPromise) return promptPromise;
        promptPromise = Promise.resolve().then(() => {
            const value = global.prompt('请输入 DentalChart 共享访问密码');
            const password = String(value || '').trim();
            if (!password) throw new Error('已取消访问验证');
            sessionStorage.setItem(ACCESS_KEY, password);
            return password;
        }).finally(() => {
            promptPromise = null;
        });
        return promptPromise;
    }

    async function password() {
        return readPassword() || requestPassword();
    }

    async function apiFetch(resource, options = {}, retry = true) {
        const headers = new Headers(options.headers || {});
        headers.set('X-Dental-Access', await password());
        if (!headers.has('Accept')) headers.set('Accept', 'application/json');

        let response;
        try {
            response = await nativeFetch(apiUrl(resource), {
                ...options,
                headers,
                credentials: 'omit'
            });
        } catch (error) {
            if (error?.name === 'AbortError') throw error;
            throw new Error('无法连接 Supabase 牙表服务');
        }

        if (response.status === 401 && retry) {
            sessionStorage.removeItem(ACCESS_KEY);
            await requestPassword();
            return apiFetch(resource, options, false);
        }
        return response;
    }

    global.DentalApi = {
        fetch: apiFetch,
        ensureAccess: password,
        clearAccess() {
            sessionStorage.removeItem(ACCESS_KEY);
        },
        endpoint: apiUrl
    };
})(window);
