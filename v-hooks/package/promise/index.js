import { ref, reactive, unref } from "vue";

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
          console.log("useAsync  ---- then");
          config?.then?.(data, loading);
          error.value = false;
        })
        .catch((error) => {
          config?.catch?.(error, loading);
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
