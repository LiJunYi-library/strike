import Cookies from "js-cookie";

function useDomainLogin(props = {}) {
  const config = {
    tokenKey: "Token",
    onTokenRemove: () => undefined,
    ...props,
  };
  let host = window.location.hostname;
  if (!/^\d+?\.\d+?\.\d+?\.\d+?/.test(host)) {
    // 是域名的话
    const arr = host.split(".").filter(Boolean).slice(-2);
    host = arr.join(".");
  }

  function getToken() {
    return Cookies.get(config.tokenKey);
  }

  function setToken(token) {
    Cookies.set(config.tokenKey, token, { domain: config.domain });
    setLocalStorageToken(token);
  }

  function removeToken() {
    Cookies.remove(config.tokenKey, { domain: config.domain });
    window.localStorage.removeItem(config.tokenKey);
  }

  function setLocalStorageToken(token) {
    window.localStorage.setItem(config.tokenKey, token);
  }

  function getLocalStorageToken() {
    return window.localStorage.getItem(config.tokenKey);
  }

  function isChangeToken() {
    if (!this.getLocalStorageToken()) return false;
    if (!this.getToken()) return false;
    return this.getLocalStorageToken() !== this.getToken();
  }

  function onVisibilitychange() {
    if (document.hidden) return;

    if (!getToken()) {
      config.onTokenRemove();
      return;
    }
  }

  document.addEventListener("visibilitychange", onVisibilitychange);
}

export function createToken(params = {}, actions) {
  let host = window.location.hostname;
  if (!/^\d+?\.\d+?\.\d+?\.\d+?/.test(host)) {
    // 是域名的话
    const arr = host.split(".").filter(Boolean).slice(-2);
    host = arr.join(".");
  }
  params = {
    tokenKey: "Token",
    domain: host,
    ...params,
  };

  return {
    isChangeToken() {
      if (!this.getLocalStorageToken()) return false;
      if (!this.getToken()) return false;
      return this.getLocalStorageToken() !== this.getToken();
    },
    cacheLocalStorageToken() {
      window.localStorage.setItem(params.tokenKey, this.getToken());
    },
    getLocalStorageToken() {
      return window.localStorage.getItem(params.tokenKey);
    },
    getToken() {
      return Cookies.get(params.tokenKey);
    },
    removeToken() {
      Cookies.remove(params.tokenKey, {
        domain: params.domain,
      });
      window.localStorage.removeItem(params.tokenKey);
    },
    setToken(token) {
      Cookies.set(params.tokenKey, token, {
        domain: params.domain,
      });
      window.localStorage.setItem(params.tokenKey, token);
    },
    addListenerToken(callback) {
      this.callback = callback;
      document.addEventListener("visibilitychange", this.onVisibilitychangeToken.bind(this));
    },

    async onVisibilitychangeToken() {
      if (!document.hidden) {
        if (this.callback) this.callback(this);
      }
    },

    removeListenerToken() {
      document.removeEventListener("visibilitychange", this.onVisibilitychangeToken.bind(this));
    },
    ...actions,
  };
}
