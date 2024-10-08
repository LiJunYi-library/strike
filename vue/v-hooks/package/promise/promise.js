import { ref, reactive } from "vue";
import { useReactive } from "../../other";
import { arrayEvents } from "@rainbow_ljy/rainbow-js";

export function getPromiseConfig(options = {}) {
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

export function usePromise(fun, options = {}) {
  const queue = [];
  const defQueue = [];

  const config = getPromiseConfig(options);
  const data = ref(config.data);
  const begin = ref(config.begin);
  const errorData = ref(config.errorData);
  const loading = ref(config.loading);
  const error = ref(config.error);

  function create(params, task = [], promiseConfig = {}) {
    if (params instanceof Function) {
      const send = (...arg) => {
        const pro = params(...arg);
        const newPromise = new Promise((resolve, reject) => {
          promiseConfig?.before?.();
          if (pro instanceof Promise) {
            pro
              .then((result) => {
                if (newPromise.abouted) return;
                promiseConfig?.then?.(result);
                resolve(result);
              })
              .catch((err) => {
                if (newPromise.abouted) return;
                promiseConfig?.catch?.(err);
                reject(err);
              })
              .finally(() => {
                const index = task.findIndex((ele) => ele === newPromise);
                if (index >= 0) task.splice(index, 1);
                if (newPromise.abouted) return;
                promiseConfig?.finally?.();
              });
          } else {
            promiseConfig?.then?.(pro);
            resolve(pro);
          }
        });
        newPromise.abouted = false;
        task.push(newPromise);
        return newPromise;
      };
      return send;
    }
  }

  const createPromise = (params) => create(params, defQueue);

  const send = create(fun, queue, {
    before: () => {
      loading.value = true;
      config?.before?.();
    },
    then: (result) => {
      data.value = config.formatterData(result);
      loading.value = false;
      error.value = false;
      config.then(result);
    },
    catch: (err) => {
      errorData.value = config.formatterErrorData(err);
      error.value = true;
      loading.value = false;
      config.catch(err);
    },
    finally: () => {
      config.finally();
    },
  });

  const beginSend = create(fun, queue, {
    before: () => {
      begin.value = true;
      loading.value = true;
      config?.before?.();
    },
    then: (result) => {
      data.value = config.formatterData(result);
      loading.value = false;
      error.value = false;
      begin.value = false;
      config.then(result);
    },
    catch: (err) => {
      errorData.value = config.formatterErrorData(err);
      error.value = true;
      loading.value = false;
      begin.value = false;
      config.catch(err);
    },
    finally: () => {
      config.finally();
    },
  });

  function about() {
    queue.forEach((el) => {
      el.abouted = true;
    });
    defQueue.forEach((el) => {
      el.abouted = true;
    });
  }

  function nextSend(...args) {
    about();
    return send(...args);
  }

  function nextBeginSend(...args) {
    about();
    return beginSend(...args);
  }

  function awaitSend(...args) {
    if (loading.value === true) return;
    return send(...args);
  }

  function awaitBeginSend(...args) {
    if (loading.value === true) return;
    return beginSend(...args);
  }

  const params = {
    data,
    begin,
    loading,
    error,
    errorData,
    send,
    beginSend,
    nextSend,
    nextBeginSend,
    awaitSend,
    awaitBeginSend,
    createPromise,
    about,
    run: nextSend, // 废弃
    runBegin: nextBeginSend, // 废弃
    fetchBegin: nextBeginSend, // 废弃
    fetch: nextSend, // 废弃
  };

  params.proxy = reactive(params);

  return params;
}

export function usePromise2(fun, options = {}) {
  const queue = [];
  const defQueue = [];

  const errLoading = { message: "loading", code: 41 };
  const errAbout = { message: "about", code: 20 };
  const errTimeout = { message: "Request Timeout", code: 48 };

  const events = arrayEvents();
  const successEvents = arrayEvents();
  const errEvents = arrayEvents();
  const fetchEvents = arrayEvents();
  let timer;
  const config = getPromiseConfig(options);
  const data = ref(config.data);
  const begin = ref(config.begin);
  const errorData = ref(config.errorData);
  const loading = ref(config.loading);
  const error = ref(config.error);


  function create(params, task = [], promiseConfig = {}) {
    if (params instanceof Function) {
      const send = (...arg) => {
        const pro = params(...arg);
        const newPromise = new Promise((resolve, reject) => {
          promiseConfig?.before?.();
          if (pro instanceof Promise) {
            pro
              .then((result) => {
                if (newPromise.abouted) return;
                promiseConfig?.then?.(result);
                events.invoke(result);
                resolve(result);
              })
              .catch((err) => {
                if (newPromise.abouted) return;
                promiseConfig?.catch?.(err);
                errEvents.invoke(err);
                reject(err);
              })
              .finally(() => {
                const index = task.findIndex((ele) => ele === newPromise);
                if (index >= 0) task.splice(index, 1);
                if (newPromise.abouted) return;
                promiseConfig?.finally?.();
              });
          } else {
            promiseConfig?.then?.(pro);
            resolve(pro);
          }
        });
        newPromise.abouted = false;
        task.push(newPromise);
        return newPromise;
      };
      return send;
    }
  }

  const createPromise = (params) => create(params, defQueue);

  const send = create(fun, queue, {
    before: () => {
      loading.value = true;
      error.value = false;
      config?.before?.();
    },
    then: (result) => {
      data.value = config.formatterData(result);
      loading.value = false;
      error.value = false;
      config.then(result);
    },
    catch: (err) => {
      errorData.value = config.formatterErrorData(err);
      error.value = true;
      loading.value = false;
      config.catch(err);
    },
    finally: () => {
      config.finally();
    },
  });

  const beginSend = create(fun, queue, {
    before: () => {
      begin.value = true;
      loading.value = true;
      error.value = false;
      config?.before?.();
    },
    then: (result) => {
      data.value = config.formatterData(result);
      loading.value = false;
      error.value = false;
      begin.value = false;
      config.then(result);
    },
    catch: (err) => {
      errorData.value = config.formatterErrorData(err);
      error.value = true;
      loading.value = false;
      begin.value = false;
      config.catch(err);
    },
    finally: () => {
      config.finally();
    },
  });

  function about() {
    queue.forEach((el) => {
      el.abouted = true;
    });
    defQueue.forEach((el) => {
      el.abouted = true;
    });
  }

  function nextSend(...args) {
    about();
    return send(...args);
  }

  function nextBeginSend(...args) {
    about();
    return beginSend(...args);
  }

  function awaitSend(...args) {
    if (loading.value === true) throw errLoading;
    return send(...args);
  }

  function awaitBeginSend(...args) {
    if (loading.value === true) throw errLoading;
    return beginSend(...args);
  }

  const params = useReactive({
    data,
    begin,
    loading,
    error,
    errorData,
    events,
    errEvents,
    successEvents,
    send,
    beginSend,
    nextSend,
    nextBeginSend,
    awaitSend,
    awaitBeginSend,
    createPromise,
    about,
  });

  return params;
}


export function usePromiseHoc(){
  
}
