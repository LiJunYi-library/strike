import { ref, reactive } from "vue";
export * from "./fetch.js";

export { createHttpRequest, useFetchHoc, createHttpFetch };

function parseParams(object) {
  if (!object) return "";
  if (typeof object !== "object") return object;
  if (!Object.keys(object).length) return "";
  let str = "";
  for (const key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      let element = object[key];
      if (typeof element === "object") {
        if (element instanceof Array) element = element.toString();
        else element = JSON.stringify(element);
      }
      if (element === undefined) continue;
      if (element + "" === "NaN") element = null;
      str += `${key}=${element}&`;
    }
  }
  str = str.slice(0, -1);
  return `?${str}`;
}

function mergeRequestInit(source = {}, target = {}) {
  let propertys = [
    "body",
    "cache",
    "credentials",
    "headers",
    "integrity",
    "keepalive",
    "method",
    "mode",
    "redirect",
    "referrer",
    "referrerPolicy",
    "signal",
    "window",
  ];
  let newObj = {};
  propertys.forEach((key) => {
    const val = source[key] || target[key];
    if (val !== undefined) newObj[key] = val;
  });
  return newObj;
}

function getFetchProps(...args) {
  let options = {};
  let propertys = ["url", "method", "body", "contentType", "headers"];
  if (args && args.length === 1 && typeof args[0] === "object") {
    options = Object.assign(options, args[0]);
  } else {
    propertys.forEach((key, index) => {
      if (args[index] !== undefined) options[key] = args[index];
    });
  }
  let h = {};
  if (options.contentType) h["Content-Type"] = options.contentType;
  let config = {
    ...options,
    headers: {
      ...h,
      ...options.headers,
    },
  };
  return config;
}

function resolveRequestInit(options = {}) {
  if (options.body instanceof Function) {
    options.body = options.body();
  }

  if (options.urlParams instanceof Function) {
    options.urlParams = options.urlParams();
  }

  const methods = ["get", "head"];
  if (methods.includes(options.method)) {
    options.urlParams = { ...options.body };
    options.body = undefined;
  }

  const urlParams = parseParams(options.urlParams);

  if (options.url && urlParams !== "") {
    options.url = options.url + urlParams;
  }

  if (options.urlPath) options.url = options.urlPath + options.url;

  const jsonContentType = ["application/json"];
  if (
    options.body !== undefined &&
    jsonContentType.includes(options.contentType) &&
    typeof options.body !== "string"
  ) {
    options.body = JSON.stringify(options.body);
  }

  const formDataType = ["multipart/form-data", "form-data"];
  if (
    options.body !== undefined &&
    formDataType.includes(options.contentType) &&
    !(options.body instanceof FormData)
  ) {
    const formData = new FormData();
    for (const key in options.body) {
      if (options.body.hasOwnProperty(key)) {
        formData.append(key, options.body[key]);
      }
    }
    options.body = formData;
  }

  const deleteContentType = ["multipart/form-data", "form-data"];
  if (deleteContentType.includes(options.contentType)) {
    if (options?.headers?.["Content-Type"]) {
      delete options?.headers?.["Content-Type"];
    }
  }
}

/* ************************* */

function createHttpRequest(initprops = {}) {
  const initConfig = getFetchProps({
    formatterResponse: async (response) => {
      return await response.json();
    },
    formatterStatus: () => [200],
    method: "get",
    urlPath: "",
    timeout: 60000,
    ...initprops,
  });

  let _intercept = {
    request: () => undefined,
    success: () => undefined,
    error: () => undefined,
  };

  function request(...argumentS) {
    const arg = getFetchProps(...argumentS);
    const config = {
      ...initConfig,
      ...arg,
      headers: {
        ...initConfig.headers,
        ...arg.headers,
      },
    };

    let timer;
    let controller = new AbortController();

    resolveRequestInit(config);
    const requestInit = mergeRequestInit(config, {
      signal: controller.signal,
    });

    return new Promise((resolve, reject) => {
      _intercept.request({ config, requestInit, resolve, reject });
      fetch(config.url, requestInit)
        .then(async (response) => {
          let data;
          if (config.formatterStatus().includes(response.status)) {
            try {
              data = await config.formatterResponse(response);
              _intercept.success({ config, requestInit, response, data, resolve, reject });
              resolve(data);
            } catch (error) {
              console.error(error);
            }
          } else {
            try {
              data = await config.formatterResponse(response);
              _intercept.error({ config, requestInit, response, data, resolve, reject });
              reject(response);
            } catch (error) {
              console.error(error);
            }
          }
        })
        .catch((error) => {
          _intercept.error({ config, requestInit, error, resolve, reject });
          reject(error);
        });

      if (initConfig.timeout) {
        timer = setTimeout(() => {
          controller.abort();
        }, initConfig.timeout);
      }
    });
  }

  request.intercept = {
    request: (fun) => {
      _intercept.request = fun;
    },
    response: ({ success, error }) => {
      _intercept.success = success;
      _intercept.error = error;
    },
  };

  return request;
}

function useFetchHoc(request) {
  function context(...props) {
    let config = {
      begin: false,
      loading: false,
      error: false,
      ...getFetchProps(...props),
    };
    let controller = new AbortController();
    let pro;

    const data = ref(config.data);
    const begin = ref(config.begin);
    const errorData = ref(config.errorData);
    const loading = ref(config.loading);
    const error = ref(config.error);

    const params = {
      data,
      begin,
      errorData,
      loading,
      error,
      send,
      awaitSend,
      nextSend,
      abort,
      beginSend,
      nextBeginSend,
      awaitBeginSend,
    };

    params.proxy = reactive(params);

    function send(...arg) {
      loading.value = true;
      error.value = false;
      controller = new AbortController();
      let sendConfig = getFetchProps(...arg);
      pro = request({
        ...config,
        ...sendConfig,
        signal: controller.signal,
      })
        .then((result) => {
          data.value = result;
          return result;
        })
        .catch((err) => {
          errorData.value = err;
          error.value = true;
          return Promise.reject(err);
        })
        .finally(() => {
          loading.value = false;
          begin.value = false;
        });
      return pro;
    }

    function beginSend(...arg) {
      begin.value = true;
      return send(...arg);
    }

    async function nextBeginSend(...arg) {
      await abort();
      return beginSend(...arg);
    }

    function awaitBeginSend(...arg) {
      if (loading.value === true) {
        console.error("正在请求");
        return;
      }
      return beginSend(...arg);
    }

    async function time0() {
      return new Promise((res) => {
        setTimeout(() => {
          res(true);
        }, 0);
      });
    }

    async function abort() {
      if (!controller) return params.proxy;
      controller.abort();
      await time0();
      return params.proxy;
    }

    async function nextSend(...arg) {
      await abort();
      return send(...arg);
    }

    function awaitSend(...arg) {
      if (loading.value === true) {
        console.error("正在请求");
        return;
      }
      return send(...arg);
    }

    return params;
  }
  return context;
}

function createHttpFetch(request) {
  return {};
  const get = request.create({ method: "get", contentType: "" });
  const post = request.create({ method: "post", contentType: "application/json" });
  const form = request.create((config) => {
    const formData = new FormData();
    const body = config.body;
    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        formData.append(key, body[key]);
      }
    }
    config.body = formData;
    config.method = "post";
    return config;
  });

  return { get, post, form };
}
