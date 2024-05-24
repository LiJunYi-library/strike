export class Queue {
  constructor(obj = {}) {
    this.callBack = obj.callBack;
    this.thenCallBack = obj.thenCallBack;
    this.catchCallBack = obj.catchCallBack;
    this.finalCallBack = obj.finalCallBack;
    this.abortCallBack = obj.finalCallBack;
    this.loading = true;
    this.callBack(this.resolve.bind(this), this.reject.bind(this));
  }

  resolve(...arg) {
    if (this.loading === false) return;
    if (this.thenCallBack) this.thenCallBack(...arg);
    if (this.finalCallBack) this.finalCallBack(...arg);
    this.loading = false;
  }
  reject(...arg) {
    if (this.loading === false) return;
    if (this.catchCallBack) this.catchCallBack(...arg);
    if (this.finalCallBack) this.finalCallBack(...arg);
    this.loading = false;
  }

  then(thenCallBack) {
    this.thenCallBack = thenCallBack;
    return this;
  }
  catch(catchCallBack) {
    this.catchCallBack = catchCallBack;
    return this;
  }
  finally(finalCallBack) {
    this.finalCallBack = finalCallBack;
    return this;
  }

  abort(abortCallBack, ...arg) {
    this.abortArg = [...arg];
    this.abortCallBack = abortCallBack;
    return this;
  }

  termination() {
    this.loading = false;
    if (this.abortCallBack) this.abortCallBack(...this.abortArg);
  }
}

export function QueuePromise(callBack) {
  let currentQueue, prveQueue;

  Object.defineProperties(this, {
    then: {
      value: (thenCallBack) => {
        if (prveQueue && prveQueue.loading === true) {
          prveQueue.termination();
        }
        currentQueue = new Queue({ callBack, thenCallBack });
        prveQueue = currentQueue;
        return currentQueue;
      },
    },
    catch: {
      value: (catchCallBack) => {
        if (prveQueue && prveQueue.loading === true) {
          prveQueue.termination();
        }
        currentQueue = new Queue({ callBack, catchCallBack });
        prveQueue = currentQueue;
        return currentQueue;
      },
    },
    finally: {
      value: (finalCallBack) => {
        if (prveQueue && prveQueue.loading === true) {
          prveQueue.termination();
        }
        currentQueue = new Queue({ callBack, finalCallBack });
        prveQueue = currentQueue;
        return currentQueue;
      },
    },
  });
}

export function mergePageEvent(time = 0) {
  return new QueuePromise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}

export function mergeEvent(time = 0) {
  return new QueueFuture((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}

export function Future(callBack) {
  let thenCallBack,
    catchCallBack,
    finalCallBack,
    abortCallBack,
    cancelCallBack,
    loading,
    data;

  loading = true;

  function resolve(...arg) {
    if (loading === false) return;
    if (thenCallBack) data = thenCallBack(...arg);
    if (finalCallBack) finalCallBack(...arg);
    loading = false;
  }

  function reject(...arg) {
    if (loading === false) return;
    console.error(JSON.stringify(arg));
    if (catchCallBack) data = catchCallBack(...arg);
    if (finalCallBack) finalCallBack(...arg);
    loading = false;
  }

  function cancel(cb) {
    cancelCallBack = cb;
  }

  this.termination = (...arg) => {
    loading = false;
    if (abortCallBack) abortCallBack(...arg);
    if (cancelCallBack) cancelCallBack();
  };

  if (callBack)
    callBack(resolve.bind(this), reject.bind(this), cancel.bind(this));

  this.getLoading = () => loading;

  this.then = (cb) => {
    thenCallBack = cb;
    return this;
  };

  this.catch = (cb) => {
    catchCallBack = cb;
    return this;
  };

  this.finally = (cb) => {
    finalCallBack = cb;
    return this;
  };

  this.abort = (cb) => {
    abortCallBack = cb;
    return this;
  };
}

export function queueFutureApply(cb) {
  const method = cb;
  method.prve = null;
  method.current = null;
  return new Proxy(method, {
    apply(target, context, argumentsList = []) {
      if (method.prve && method.prve.getLoading()) method.prve.termination();
      method.current = target.apply(context, argumentsList);
      if (!(method.current instanceof Future)) {
        console.error(method.name + " return value is not Future");
      }
      method.prve = method.current;
      return method.current;
    },
  });
}

export function QueueFuture(callBack) {
  let current, prve;
  this.then = null;
  this.catch = null;
  this.finally = null;
  this.abort = null;
  const methods = ["then", "catch", "finally", "abort"];
  const properties = methods.reduce((add, key, index) => {
    add[key] = {
      value: (CB) => {
        if (prve && prve.getLoading()) prve.termination();
        current = new Future(callBack)[key](CB);
        prve = current;
        return current;
      },
    };
    return add;
  }, {});
  Object.defineProperties(this, properties);
}

export function awaitFutureApply(cb) {
  const method = cb;
  method.prve = null;
  method.current = null;

  method.then = (cb) => method;
  method.catch = (cb) => method;
  method.finally = (cb) => method;
  method.abort = (cb) => {
    method.current = new Future().abort(cb);
    method.current.termination();
    return method.current;
  };

  return new Proxy(method, {
    apply(target, context, argumentsList = []) {
      if (method.prve && method.prve.getLoading()) {
        return method;
      }

      method.current = target.apply(context, argumentsList);
      if (!(method.current instanceof Future)) {
        console.error(method.name + " return value is not Future");
      }
      method.prve = method.current;
      return method.current;
    },
  });
}

export function AwaitFuture(callBack) {
  let current, prve;
  this.then = null;
  this.catch = null;
  this.finally = null;
  this.abort = null;
  const methods = ["then", "catch", "finally", "abort"];
  const properties = methods.reduce((add, key, index) => {
    add[key] = {
      value: (CB) => {
        if (prve && prve.getLoading()) {
          if (key === "abort") {
            current = new Future()[key](CB);
            current.termination();
            return current;
          }
          return this;
        }
        current = new Future(callBack)[key](CB);
        prve = current;
        return current;
      },
    };
    return add;
  }, {});
  Object.defineProperties(this, properties);
}

export function mergeQueueFutureApply(
  methods,
  bListener,
  thenCB,
  catchCB,
  abortCB
) {
  const margeEvent = queueFutureApply(
    (promise) => new Future((rev, rej) => promise.then(rev).catch(rej))
  );

  const listener = (promise, ...arg) => {
    margeEvent(promise)
      .then(async (data) => {
        if (thenCB) thenCB(data, ...arg);
      })
      .abort((data) => {
        if (abortCB) abortCB(data, ...arg);
      })
      .catch((data) => {
        if (catchCB) catchCB(data, ...arg);
      });
  };

  this.bind = () => {
    methods.forEach((method) => {
      method.addOnApplyListener(bListener);
      method.addAfterApplyListener(listener);
    });
    return this;
  };

  this.destroy = () => {
    methods.forEach((method) => {
      method.removeOnApplyListener(bListener);
      method.removeAfterApplyListener(listener);
    });
    return this;
  };
}

export function mergeAwaitFutureApply(
  methods,
  bListener,
  thenCB,
  catchCB,
  abortCB
) {
  const margeEvent = awaitFutureApply(
    (promise) => new Future((rev, rej) => promise.then(rev).catch(rej))
  );

  const listener = (promise, ...arg) => {
    margeEvent(promise)
      .then(async (data) => {
        if (thenCB) thenCB(data, ...arg);
      })
      .abort((data) => {
        if (abortCB) abortCB(data, ...arg);
      })
      .catch((data) => {
        if (catchCB) catchCB(data, ...arg);
      });
  };

  this.bind = () => {
    methods.forEach((method) => {
      method.addOnApplyListener(bListener);
      method.addAfterApplyListener(listener);
    });
    return this;
  };

  this.destroy = () => {
    methods.forEach((method) => {
      method.removeOnApplyListener(bListener);
      method.removeAfterApplyListener(listener);
    });
    return this;
  };
}

export class PROMISE {}

PROMISE.Queue = Queue;
PROMISE.QueuePromise = QueuePromise;
PROMISE.mergeEvent = mergeEvent;
PROMISE.Future = Future;
PROMISE.QueueFuture = QueueFuture;

export function useFuture(fun) {
  const queue = [];
  const defQueue = [];
  let loading = false;

  function create(params, task = []) {
    if (params instanceof Function) {
      const send = (...arg) => {
        const pro = params(...arg);
        const newPromise = new Promise((resolve, reject) => {
          if (pro instanceof Promise) {
            pro
              .then((rest) => {
                if (newPromise.abouted) return;
                resolve(rest);
              })
              .catch((rest) => {
                if (newPromise.abouted) return;
                reject(rest);
              })
              .finally(() => {
                const index = task.findIndex((ele) => ele === newPromise);
                if (index >= 0) task.splice(index, 1);
              });
          } else {
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

  const send = create(fun, queue);

  const createPromise = (params) => create(params, defQueue);

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

  function awaitSend(...args) {
    if (loading === true) return;
    loading = true;
    return send(...args).finally(() => {
      loading = false;
    });
  }

  return { send, nextSend, createPromise, awaitSend };
}

export function useNextFuture(...arg) {
  const future = useFuture(...arg);
  const play = async (...parms) => {
    const res = await future.nextSend(...parms);
    return res;
  };
  Object.assign(play, future);
  return play;
}
