import { ref, reactive, unref, onBeforeUnmount } from "vue";

export const getPromiseConfig = (options = {}) => ({
  then: () => undefined,
  catch: () => undefined,
  finally: () => undefined,
  verify: () => undefined,
  data: undefined,
  errorData: undefined,
  loading: false,
  error: false,
  formatterData: (val) => val,
  formatterErrorData: (val) => val,
  ...options,
});

export function useAsync(fun, options = {}) {
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
          loading.value = false;
          config?.finally?.(loading);
        });
    }
  };
  const hooks = reactive({ loading, error, invoker });
  return hooks;
}

export function usePromise(fun, options = {}) {
  const config = getPromiseConfig(options);

  const data = ref(config.data);
  const errorData = ref(config.errorData);
  const loading = ref(config.loading);
  const error = ref(config.error);
  const run = (...arg) => {
    loading.value = true;
    error.value = false;
    return new Promise((resolve, reject) => {
      const res = fun(...arg);
      const invoker = (result) => {
        data.value = config.formatterData(result);
        loading.value = false;
        error.value = false;
        resolve(result);
      };

      if (res instanceof Promise) {
        res.then(invoker).catch((err) => {
          // console.log('--userPromise--catch');
          errorData.value = config.formatterErrorData(err);
          error.value = true;
          loading.value = false;
          reject(err);
        });
      } else {
        invoker(res);
      }
    });
  };

  const parms = { data, loading, error, errorData, run };
  return reactive(parms);
}

export async function awaitTime(t = 2000) {
  return new Promise((rev) => {
    setTimeout(() => {
      rev(true);
    }, t);
  });
}

export function apply(func, context) {
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

export function useInterceptPromiseApply(options = {}) {   
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

export function usePromiseTask(fun, options = {}) {
  const dataLoading = ref(false);
  const loading = ref(false);
  const disable = ref(false);

  const error = ref(false);
}
