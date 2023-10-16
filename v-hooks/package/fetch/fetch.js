import { createOverload } from "@rainbow_ljy/rainbow-js";

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

class Body {
  constructor(obj) {
    Object.assign(this, obj);
  }
}

const options = {
  onRequest() {
    //
  },
  onResponse() {
    //
  },
};

function createHttpRequest2(options = {}) {
  const config = {
    url: "",
    method: "get",
    body: undefined,
    headers: {},
    contentType: undefined,
    data: undefined,
    urlParams: undefined,
    timeout: 2000,
    formatterSuccessResponse: async (response) => {
      if (response.type === "application/json") {
        return await response.json();
      }
      return response;
    },
    formatterErrorResponse: async (response) => {
      if (response.type === "application/json") {
        return await response.json();
      }
      return response;
    },
    formatterStatus: (response) => response.status === 200,
  };

  // const request = createOverload((overloadCB) => {
  //   overloadCB.addimpl("Object", (object) => {
  //     Object.assign(request.$config, object);
  //     console.log("Object", request.$config);
  //   });

  //   overloadCB.addimpl("String", function setUrl(url) {
  //     config.url = url;
  //     return promise();
  //   });

  //   overloadCB.addimpl(["String", "Object"], (url, data) => {
  //     config.url = url;
  //     config.data = data;
  //   });

  //   overloadCB.addimpl(["String", "Object", "String"], (url, data, contentType) => {
  //     config.url = url;
  //     config.data = data;
  //     config.contentType = contentType;
  //   });
  //   //  //   //
  //   overloadCB.addimpl(["String", "String"], (url, method) => {
  //     config.url = url;
  //     config.method = method;
  //   });

  //   overloadCB.addimpl(["String", "String", "Object"], (url, method, body) => {
  //     config.url = url;
  //     config.method = method;
  //     config.body = body;
  //   });

  //   overloadCB.addimpl(["String", "Function"], (url, body) => {
  //     config.url = url;
  //     config.body = body;
  //   });
  // });

  //currie
  let $config = Object.assign({}, config);

  function request(url, a, b, c) {
    console.log("?????????????????");
    console.log(url, a, b, c);
    $config.url = url;
    // let opos = Object.assign({ url }, $config);
    // console.log(opos);
    let pro = promise();
    $config = Object.assign({}, config);
    return pro;
  }

  // request.toBind = (obj) => {
  //   console.log("request.toBind", obj);
  //   function func(...args) {
  //     console.log("toBind", ...args);
  //     return request(obj, ...args);
  //   }
  //   Object.assign(func, request.prototype.constructor);
  //   return func;
  // };

  request.setUrlParams = (urlParams) => {
    $config.urlParams = urlParams;
    return request;
  };

  request.setData = (data) => {
    $config.data = data;
    return request;
  };

  function promise() {
    let controller = new AbortController();
    let timer;

    controller.signal.onabort = () => {
      console.log(" controller.signal.onabort ");
    };

    const promise = new Promise((resolve, reject) => {
      const requestInit = {};
      // const $config = request.$config;
      // _intercept.request({ config, requestInit, resolve, reject });
      const str = parseParams($config.urlParams);
      const uri = $config.url + str;
      console.log(uri, "config ", $config);
      fetch(uri, {
        signal: controller.signal,
      })
        .then(async (response) => {
          resolve(response);
          // let data;
          // if (config.formatterStatus().includes(response.status)) {
          //   try {
          //     data = await config.formatterResponse(response);
          //     _intercept.success({ config, requestInit, response, data, resolve, reject });
          //     resolve(data);
          //   } catch (error) {
          //     console.error(error);
          //   }
          // } else {
          //   try {
          //     data = await config.formatterResponse(response);
          //     _intercept.error({ config, requestInit, response, data, resolve, reject });
          //     reject(response);
          //   } catch (error) {
          //     console.error(error);
          //   }
          // }
        })
        .catch((error) => {
          console.log(" fetch.catch ", error.code, error.name);
          // _intercept.error({ config, requestInit, error, resolve, reject });
          // reject(error);
        });

      if ($config.timeout) {
        timer = setTimeout(() => {
          controller.abort();
          options?.onTimeout?.();
        }, $config.timeout);
      }
    });

    promise.key = "____";

    return promise;
  }

  return request;
}

const aaa = createHttpRequest2({
  data() {
    return {
      Message: {
        success: {
          text: "操作成功",
          visible: false,
        },
        error: {
          text: "失败了",
          visible: true,
        },
      },
      ///
      Overlay: {
        visible: false,
        use: false,
      },
    };
  },
  currie: {
    useMessage(text) {
      this.Message.success.text = text;
      this.Message.success.visible = true;
    },
    useOverlay() {
      this.Overlay.use = true;
    },
  },
  onRequest() {
    function handleOverlay() {
      if (!this.Overlay.use) return;
      this.Overlay.visible = true;
      console.log("弹出遮罩");
    }
  },
  onResponse() {
    function handleOverlay() {
      if (!this.Overlay.use) return;
      this.Overlay.visible = false;
      console.log("关闭遮罩");
    }
  },
  onTimeout() {
    console.log("超时 onTimeout");
  },
});

// (async function name(params) {
//   let pro = aaa.setUrlParams({ page: 30 }).setData({ dd: 30 })("http://dev-test.com/api/list");
//   console.log(pro);
//   // aaa.setUrlParams({ size: 30 }).setData({ aa: 30 })("http://dev-test.com/api/list");

//   // aaa("http://dev-test.com/api/list");
// })();

// // aaa("https");.message("添加成功")
// // aaa("https", {});
// // aaa("https", {}, "contentType");
// // aaa("https", "post");
