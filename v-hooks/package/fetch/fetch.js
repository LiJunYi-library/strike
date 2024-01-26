import { isRef, ref, reactive } from "vue";

export function useFetchHOC(props = {}) {
  const options = {
    formatterFileName: (res, config) => {
      const fName = decodeURIComponent(
        res.headers.get("Content-Disposition").split("filename=").pop()
      );
      const fileName = fName || config.fileName;
      return fileName;
    },
    formatterResponse: async (res, config) => {
      const fileName = config.formatterFileName(res, config);
      const d = await res.blob();
      if (config.isDownloadFile) downloadFile(d, fileName);
      console.warn("未处理 响应 Content-Type 默认文件", config.isDownloadFile);
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

  function useFetch(props = {}) {
    const config = { ...options, ...props };

    let controller = new AbortController();
    let timer;

    function getBody() {
      if (!config.body) return undefined;
      if (config.body instanceof Function) return config.body();
      if (isRef(config.body)) return config.body.value;
      return config.body;
    }

    function revBody(contentType) {
      const _body = getBody();
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

    function getHeaders() {
      const headers_ = {};
      if (config.headers) return config.headers;
      if (config.contentType) headers_["Content-Type"] = config.contentType;
      return headers_;
    }

    function getParams() {
      if (!config.urlParams) return undefined;
      if (config.urlParams instanceof Function) return config.urlParams();
      if (isRef(config.urlParams)) return config.urlParams.value;
      return config.urlParams;
    }

    const loading = ref(config.loading);
    const data = ref(config.data);
    const begin = ref(config.begin);
    const error = ref(config.error);
    const errorData = ref(config.errorData);
    const params = {
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
    };
    params.proxy = reactive(params);

    async function send() {
      loading.value = true;
      controller = new AbortController();
      const url = config.baseUrl + config.url + parseParams(getParams());
      const headers = getHeaders();
      const body = revBody(headers["Content-Type"]);
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

      return fetch(URL, fetchConfig)
        .catch((err) => {
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
          return Promise.reject(err);
        })
        .then(async (res) => {
          const resContentType = res.headers.get("Content-Type");
          let d;

          switch (resContentType) {
            default:
              d = await config.formatterResponse(res, config);
              break;

            case "application/json":
              d = await res.json();
              break;
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
        });
    }

    function nextSend() {
      controller.abort();
      return send();
    }

    function awaitSend() {
      if (loading.value === true) return Promise.reject(" loading ");
      return send();
    }

    function beginSend() {
      begin.value = true;
      return send();
    }

    function nextBeginSend() {
      begin.value = true;
      return nextSend();
    }

    function awaitBeginSend() {
      if (loading.value === true) return Promise.reject(" loading ");
      return beginSend();
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
