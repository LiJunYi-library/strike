import { ref, reactive } from "vue";

class Abort_controller {
  constructor(props = {}) {
    Object.assign(this, props);
  }

  signal = {
    about: () => undefined,
    onAbout: () => {
      this.onAbout();
    },
  };

  about() {
    this.signal.about();
  }

  onAbout() {}
}

function ppppppp(fun) {
  let controller = new Abort_controller();
  const data = ref({});
  const begin = ref(config.begin);
  const errorData = ref(config.errorData);
  const loading = ref(config.loading);
  const error = ref(config.error);

  controller.onAbout = () => {
    loading.value = false;
  };

  function send(...arg) {
    loading.value = true;
    error.value = false;
    controller = new Abort_controller();

    usePromise({
      signal: controller.signal,
    })
      .then((result) => {
        data.value = result;
      })
      .catch((err) => {
        errorData.value = err;
        error.value = true;
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

function usePromise(fun, options) {
  const config = {
    signal: {},
    ...options,
  };

  const method = (...arg) => {
    const newPro = new Promise((resolve, reject) => {
      config.signal.about = () => {
        config?.signal?.onAbout?.();
        reject();
      };
      const result = fun(...arg);
      if (result instanceof Promise) {
        result
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
    return newPro;
  };

  return method;
}
