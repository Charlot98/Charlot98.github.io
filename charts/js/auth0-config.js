/**
 * Auth0 公开配置（Domain / Client ID 不是密钥，可放前端）。
 * 在 Auth0 Dashboard 创建「Single Page Application」后，填入下方两项。
 *
 * 回调 / 登出 / Web Origins 请加入本站点地址，例如：
 *   http://127.0.0.1:5503/charts/login.html
 *   http://localhost:5503/charts/login.html
 *   http://127.0.0.1:5503/charts
 * （按你实际访问的 origin + 路径填写）
 */
window.AUTH0_CONFIG = {
  domain: 'dev-6anfik1jar5r5klz.us.auth0.com',
  clientId: 'TnH55IBNzTwNJrCVH0kO0557YVtOh3JI',
  // 多页静态站需要本地缓存，刷新/跳转后才能保持登录
  cacheLocation: 'localstorage',
  useRefreshTokens: true
};
