import { ref, reactive, unref, onBeforeUnmount } from "vue";

export {
  useAsync,
  nextTaskHoc,
  waitTaskHoc,
  awaitTime,
  apply,
  useInterceptPromiseApply,
  usePromiseTask,
};
export const nextTask = nextTaskHoc();

/**
 *
 * @param {*} options
 * @returns
 */
function getPromiseConfig(options = {}) {
  return {
    then: () => undefined,
    catch: () => undefined,
    finally: () => undefined,
    verify: () => undefined,
    data: undefined,
    errorData: undefined,
    loading: false,
    begin: false,
    error: false,
    formatterData: (val) => val,
    formatterErrorData: (val) => val,
    ...options,
  };
}

function useAsync(fun, options = {}) {
  const config = getPromiseConfig(options);
  const loading = ref(false);
  const error = ref(false);
  const invoker = async (...arg) => {
    const bool = await config?.verify?.(...arg);
    if (bool === true) return;
    const rest = fun(...arg);
    if (rest instanceof Promise) {
      loading.value = true;
      rest
        .then((data) => {
          // console.log("useAsync  ---- then");
          config?.then?.(data, loading);
          error.value = false;
        })
        .catch((err) => {
          config?.catch?.(err, loading);
          error.value = true;
        })
        .finally(() => {
          // console.log("finally", ...arg);
          loading.value = false;
          config?.finally?.(loading);
        })
        ?.about?.(() => {
          loading.value = false;
        });
    }
  };
  const hooks = reactive({ loading, error, invoker });
  return hooks;
}

function nextTaskHoc(options = {}) {
  const config = {
    prvePromise: undefined,
    loading: false,
    aboutCb: undefined,
    ...options,
  };
  return function nextTask(fun) {
    const method = (...arg) => {
      const newPro = new Promise((resolve, reject) => {
        const promise = fun(...arg);
        config.prvePromise = promise;
        if (promise instanceof Promise) {
          promise
            .then((result) => {
              if (config.prvePromise !== promise) {
                if (config.aboutCb) config.aboutCb(result);
                return;
              }
              // console.log("nextTask-----------------then", result);
              resolve(result);
            })
            .catch((error) => {
              if (config.prvePromise !== promise) {
                if (config.aboutCb) config.aboutCb(error);
                return;
              }
              // console.log("nextTask-----------------catch", error);
              reject(error);
            });
        } else {
          resolve(promise);
        }
      });
      newPro.about = (fun) => {
        config.aboutCb = fun;
        // console.log( config.aboutCb);
        return newPro;
      };
      return newPro;
    };
    return method;
  };
}

function waitTaskHoc(options = {}) {
  const config = {
    prvePromise: undefined,
    loading: false,
    ...options,
    aboutCb: null,
  };
  return function waitTask(fun) {
    const method = (...arg) => {
      const newPro = new Promise((resolve, reject) => {
        if (config.loading === true) {
          // console.log("waitTask-----------------error",  config.aboutCb);
          if (config.aboutCb) config.aboutCb();
          return;
        }
        const promise = fun(...arg);
        config.loading = true;
        config.prvePromise = promise;
        if (promise instanceof Promise) {
          promise
            .then((result) => {
              if (config.prvePromise !== promise) return;
              // console.log("waitTask-----------------then", result);
              resolve(result);
            })
            .catch((error) => {
              if (config.prvePromise !== promise) return;
              // console.log("waitTask-----------------catch", error);
              reject(error);
            })
            .finally(() => {
              config.loading = false;
            });
        } else {
          config.loading = false;
        }
      });

      newPro.about = (fun) => {
        config.aboutCb = fun;
        return newPro;
      };

      return newPro;
    };
    return method;
  };
}

async function awaitTime(t = 2000) {
  return new Promise((rev) => {
    setTimeout(() => {
      rev(true);
    }, t);
  });
}

function apply(func, context) {
  // eslint-disable-next-line func-names
  const method = function (...params) {
    if (!context) return func(...params);
    return func.call(context, ...params);
  };

  Object.defineProperties(method, {
    onApplyListener: {
      value: [],
    },
    afterApplyListener: {
      value: [],
    },
    addOnApplyListener: {
      value: (fun) => {
        if (!method.onApplyListener) return;
        method.onApplyListener.push(fun);
      },
    },
    removeOnApplyListener: {
      value: (fun) => {
        if (!method.onApplyListener) return;
        method.onApplyListener = method.onApplyListener.filter((el) => el !== fun);
      },
    },
    addAfterApplyListener: {
      value: (fun) => {
        if (!method.afterApplyListener) return;
        method.afterApplyListener.push(fun);
      },
    },
    removeAfterApplyListener: {
      value: (fun) => {
        if (!method.afterApplyListener) return;
        method.afterApplyListener = method.afterApplyListener.filter((el) => el !== fun);
      },
    },
  });

  return new Proxy(method, {
    apply(target, ctx, args = []) {
      if (target.onApply) target.onApply(target, ...args);
      if (target.onApplyListener) target.onApplyListener.forEach((fun) => fun(target, ...args));

      const res = target.apply(ctx, args);
      if (target.afterApply) target.afterApply(res, target, ...args);
      if (target.afterApplyListener) {
        target.afterApplyListener.forEach((fun) => fun(res, target, ...args));
      }
      return res;
    },
  });
}

function useInterceptPromiseApply(options = {}) {
  const config = {
    defaultDate: undefined,
    then: () => undefined,
    catch: () => undefined,
    finally: () => undefined,
    ...options,
    listenerMethods: options.listenerMethods || [],
  };
  let prvePromise = null;
  let prveTarget = null;
  const loading = ref(false);
  const error = ref(false);
  const data = ref(config.defaultDate);
  const errorData = ref();

  const onApply = (...arg) => {
    // console.log('addOnApplyListener', ...arg);
  };

  const afterApply = (rest, target, ...arg) => {
    if (!prveTarget) prveTarget = target;
    if (prveTarget.await === true && loading.value === true) return;
    loading.value = true;
    prvePromise = rest;
    prveTarget = target;
    if (rest instanceof Promise) {
      const constructorName = rest.constructor.name;
      rest
        .then((res) => {
          if (prvePromise !== rest && constructorName === "TrackPromise") return;
          // console.log("useInterceptPromiseApply  then", res);
          error.value = false;
          data.value = res;
          errorData.value = undefined;
          config.then(res);
        })
        .catch((err) => {
          if (prvePromise !== rest && constructorName === "TrackPromise") return;
          error.value = true;
          errorData.value = err;
          config.catch(err);
        })
        .finally(() => {
          if (prvePromise !== rest && constructorName === "TrackPromise") return;
          loading.value = false;
          config.finally();
        });
    } else {
      loading.value = false;
      error.value = false;
      data.value = rest;
      errorData.value = undefined;
    }
  };

  config.listenerMethods.forEach((fun) => {
    fun.addOnApplyListener(onApply);
    fun.addAfterApplyListener(afterApply);
  });

  onBeforeUnmount(() => {
    config.listenerMethods.forEach((fun) => {
      fun.removeOnApplyListener(onApply);
      fun.removeAfterApplyListener(afterApply);
    });
  });

  return { loading, error, data, errorData };
}

function usePromiseTask(fun, options = {}) {
  const config = getPromiseConfig(options);

  const data = ref(config.data);
  const errorData = ref(config.errorData);
  const loading = ref(config.loading);
  const error = ref(config.error);
  const nextTaskConfig = {
    prvePromise: undefined,
  };
  const waitTaskConfig = {
    prvePromise: undefined,
    loading: false,
  };

  const next = nextTaskHoc(nextTaskConfig);

  const wait = waitTaskHoc(waitTaskConfig);

  const run = (...arg) => {
    loading.value = true;
    error.value = false;
    return new Promise((resolve, reject) => {
      const res = fun({ nextTask: next, waitTask: wait }, ...arg);
      const invoker = (result) => {
        data.value = config.formatterData(result);
        loading.value = false;
        error.value = false;
        // console.log("-----------------then", result);
        config.then(result);
        resolve(result);
      };
      if (res instanceof Promise) {
        res.then(invoker).catch((err) => {
          errorData.value = config.formatterErrorData(err);
          error.value = true;
          loading.value = false;
          config.catch(err);
          reject(err);
        });
      } else {
        invoker(res);
      }
    });
  };

  const arguments_ = { data, loading, error, errorData, run };
  arguments_.proxy = reactive(arguments_);
  return arguments_;
}
