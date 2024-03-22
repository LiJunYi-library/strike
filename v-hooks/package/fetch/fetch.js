import { isRef, ref } from "vue";
import { useReactive } from "../../other";
import { downloadFile, arrayEvents, arrayRemove, createOverload } from "@rainbow_ljy/rainbow-js";

function getBody(config) {
  if (!config.body) return undefined;
  if (config.body instanceof Function) return config.body();
  if (isRef(config.body)) return config.body.value;
  return config.body;
}

function revBody(contentType, config) {
  const _body = getBody(config);
  if (!_body) return undefined;
  if (typeof _body !== "object") return _body;
  const formDataType = ["multipart/form-data", "form-data"];
  if (!formDataType.includes(contentType)) return JSON.stringify(_body);
  const formData = new FormData();
  for (const key in _body) {
    if (Object.prototype.hasOwnProperty.call(_body, key)) {
      formData.append(key, _body[key]);
    }
  }
  return formData;
}

function getHeaders(config) {
  const headers_ = {};
  if (config.headers) return config.headers;
  if (config.contentType) headers_["Content-Type"] = config.contentType;
  return headers_;
}

function getParams(config) {
  if (!config.urlParams) return undefined;
  if (config.urlParams instanceof Function) return config.urlParams();
  if (isRef(config.urlParams)) return config.urlParams.value;
  return config.urlParams;
}

export function parseParams(object) {
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

export function fetchQueue(props = {}) {
  const options = {
    onBegin: () => undefined,
    onFinish: () => undefined,
    onRequest: () => undefined,
    onResponse: () => undefined,
    ...props,
  };
  const queue = [];
  function push(pro, ...arg) {
    if (queue.length === 0) options.onBegin(...arg);
    options.onRequest(...arg);
    queue.push(pro);
  }
  function del(pro, ...arg) {
    arrayRemove(queue, pro);
    options.onResponse(...arg);
  }
  function remove(pro, ...arg) {
    arrayRemove(queue, pro);
    options.onResponse(...arg);
    if (queue.length === 0) options.onFinish(...arg);
  }
  return { queue, push, remove, del };
}

export function useFetchHOC(props = {}) {
  const options = {
    formatterFile: async (res, config) => {
      const file = await res.blob();
      return file;
    },
    formatterFileName: async (res, config) => {
      const disposition = res.headers.get("Content-Disposition")?.split("filename=")?.pop();
      const fName = decodeURIComponent(disposition);
      const fileName = config.fileName || fName;
      return fileName;
    },
    formatterResponse: async (res, config) => {
      let d;
      if (config.isDownloadFile) {
        d = await config.formatterFile(res, config);
        return d;
      }
      const resContentType = res.headers.get("Content-Type");
      switch (resContentType) {
        default:
          d = await res.text();
          break;
        case "application/json":
          d = await res.json();
          break;
      }
      return d;
    },
    formatterData: (d) => d,
    interceptRequest: undefined,
    interceptResponseSuccess: undefined,
    interceptResponseError: undefined,
    urlParams: undefined,
    url: "",
    baseUrl: "",
    time: 30000,
    isDownloadFile: false,
    fileName: "",
    loading: false,
    begin: false,
    error: false,
    data: undefined,
    errorData: undefined,
    fetchQueue: [],
    ...props,
  };

  function useFetch(props2 = {}) {
    const configs = { ...options, ...props2 };

    let controller = new AbortController();
    let timer;
    const errLoading = { message: "loading", code: 41 };
    const errTimeout = { message: "Request Timeout", code: 48 };
    const errAbout = { message: "about", code: 20 };
    const events = arrayEvents();
    const errEvents = arrayEvents();
    const fetchEvents = arrayEvents();

    const loading = ref(configs.loading);
    const data = ref(configs.data);
    const begin = ref(configs.begin);
    const error = ref(configs.error);
    const errorData = ref(configs.errorData);
    const params = useReactive({
      loading,
      data,
      begin,
      error,
      errorData,
      errEvents,
      events,
      send,
      nextSend,
      awaitSend,
      beginSend,
      nextBeginSend,
      awaitBeginSend,
      abort,
      abortAll,
    });

    async function asyncSend(props3) {
      const config = { ...configs, ...props3 };
      error.value = false;
      errorData.value = undefined;
      loading.value = true;
      const curController = new AbortController();
      const signalPromise = new Promise((resolve) => {
        curController.signal.addEventListener("abort", () => {
          resolve(curController.signal.reason);
        });
      });
      controller = curController;
      const url = config.baseUrl + config.url + parseParams(getParams(config));
      const headers = getHeaders(config);
      const body = revBody(headers["Content-Type"], config);
      const fetchConfig = {
        url,
        headers,
        method: config.method,
        signal: controller.signal,
        body,
      };
      config?.interceptRequest?.(fetchConfig, config);
      const URL = fetchConfig.url;
      delete fetchConfig.url;
      const current = { timer: undefined, controller: curController };
      fetchEvents.push(current);
      let fetchPromise;

      if (config.time) {
        current.timer = setTimeout(() => {
          console.log("setTimeout");
          curController.abort(errTimeout);
        }, config.time);
        timer = current.timer;
      }

      const success = (successData) => {
        loading.value = false;
        begin.value = false;
        data.value = successData;
        error.value = false;
        errorData.value = undefined;
        fetchEvents.remove(current);
        events.invoke(successData);
        clearTimeout(current.timer);
        options.fetchQueue.remove(fetchPromise, config, params);
      };

      const fail = (failData) => {
        loading.value = false;
        begin.value = false;
        error.value = true;
        errorData.value = failData;
        fetchEvents.remove(current);
        errEvents.invoke(failData);
        clearTimeout(current.timer);
        options.fetchQueue.remove(fetchPromise, config, params);
      };

      try {
        fetchPromise = fetch(URL, fetchConfig);
        options.fetchQueue.push(fetchPromise, config, params);
        const res = await fetchPromise;
        const d = await config.formatterResponse(res, config);
        if (!res.ok) throw d;

        if (config.isDownloadFile) {
          const fileName = await config.formatterFileName(res, config);
          downloadFile(d, fileName);
        }

        if (config.interceptResponseSuccess) {
          const reset = config.interceptResponseSuccess(res, d, config);
          if (reset instanceof Promise) {
            return reset
              .catch((mErr) => {
                fail(mErr);
                return Promise.reject(errorData.value);
              })
              .then(async (mRes) => {
                success(config.formatterData(mRes, d, res));
                return Promise.resolve(data.value);
              });
          }
        }

        success(d);
        return data.value;
      } catch (err) {
        fetchEvents.remove(current);
        let errorRes = err;
        if (err.code === 20) {
          options.fetchQueue.del(fetchPromise, config, params);
          errorRes = await signalPromise;
        }

        if (errorRes.code !== 20) {
          console.error("errorRes", errorRes);
          const errReset = config.interceptResponseError(errorRes, config);
          fail(errorRes);
          if (errReset) throw errReset;
        }
      }
    }

    function send(...arg) {
      const asy = asyncSend(...arg);
      return asy;
    }

    function nextSend(...arg) {
      controller.abort();
      clearTimeout(timer);
      return send(...arg);
    }

    function awaitSend(...arg) {
      if (loading.value === true) throw errLoading;
      return send(...arg);
    }

    function beginSend(...arg) {
      begin.value = true;
      return send(...arg);
    }

    function nextBeginSend(...arg) {
      begin.value = true;
      return nextSend(...arg);
    }

    function awaitBeginSend(...arg) {
      if (loading.value === true) throw errLoading;
      return beginSend(...arg);
    }

    function abort() {
      controller.abort();
      clearTimeout(timer);
      loading.value = false;
      begin.value = false;
    }

    function abortAll() {
      fetchEvents.invokes((item) => {
        item.controller.abort();
        clearTimeout(item.timer);
      });
      loading.value = false;
      begin.value = false;
    }

    return params;
  }

  return useFetch;
}

export function createFetchApi(useFetch) {
  const post = createOverload((overload) => {
    overload.addimpl("String", (url) => useFetch({ method: "post", url }));
    overload.addimpl(["String", "Object"], (url, body) => useFetch({ method: "post", url, body }));
    overload.addimpl(["String", "Function"], (url, body) =>
      useFetch({ method: "post", url, body })
    );
  }, false);

  const get = createOverload((overload) => {
    overload.addimpl("String", (url) => useFetch({ method: "get", url }));
    overload.addimpl(["String", "Object"], (url, urlParams) =>
      useFetch({ method: "get", url, urlParams })
    );
    overload.addimpl(["String", "Function"], (url, urlParams) =>
      useFetch({ method: "get", url, urlParams })
    );
  }, false);

  return { post, get };
}
