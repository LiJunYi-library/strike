import { isRef, ref } from "vue";
import { useReactive } from "../../other";

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
    ...props,
  };

  function useFetch(props2 = {}) {
    const configs = { ...options, ...props2 };

    let controller = new AbortController();
    let timer;

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
      send,
      nextSend,
      awaitSend,
      beginSend,
      nextBeginSend,
      awaitBeginSend,
      abort,
    });

    async function send(props3) {
      const config = { ...configs, ...props3 };

      loading.value = true;
      controller = new AbortController();
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

      if (config.time) {
        timer = setTimeout(() => {
          controller.abort();
          loading.value = false;
          begin.value = false;
        }, config.time);
      }

      try {
        const res = await fetch(URL, fetchConfig);
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
                error.value = true;
                errorData.value = mErr;
                return Promise.reject(mErr);
              })
              .then(async (mRes) => {
                data.value = config.formatterData(mRes, d, res);
                error.value = false;
                errorData.value = undefined;
                return Promise.resolve(data.value);
              })
              .finally(async () => {
                loading.value = false;
                begin.value = false;
              });
          }
        }

        loading.value = false;
        begin.value = false;
        data.value = d;
        return data.value;
      } catch (err) {
        console.error("error");
        if (err.code === 20) {
          console.warn("fetch is about");
        } else {
          loading.value = false;
          begin.value = false;
          error.value = true;
          errorData.value = err;
        }

        if (config.interceptResponseError) {
          const errReset = config.interceptResponseError(err, config);
          if (errReset) return errReset;
        }

        throw err;
      }
    }

    function nextSend(...arg) {
      controller.abort();
      return send(...arg);
    }

    const errLoading = { message: "loading", code: 41 };
    const errAbout = { message: "about", code: 20 };

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

    return params;
  }

  return useFetch;
}

export function downloadFile(blob, fileName) {
  if ("msSaveOrOpenBlob" in navigator) {
    window.navigator.msSaveOrOpenBlob(blob, fileName);
  } else {
    const elink = document.createElement("a");
    elink.download = fileName;
    elink.style.display = "none";
    elink.href = URL.createObjectURL(blob);
    document.body.appendChild(elink);
    elink.click();
    URL.revokeObjectURL(elink.href);
    document.body.removeChild(elink);
  }
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
