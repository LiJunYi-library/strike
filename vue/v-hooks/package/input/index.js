import { ref } from "vue";
import { useReactive } from "../../other";

export function useInput(props = {}) {
  const config = {
    required: false,
    requiredMessage: "",
    requiredVerify: (val) => val === "",
    onRequiredError: () => undefined,

    regexp: undefined,
    regexpMessage: "",
    regexpVerify: (regexp, val) => !regexp.test(val),
    onRegexpError: () => undefined,

    customVerify: () => true,
    value: "",
    ref,
    ...props,
  };

  const value = config.ref(config.value);

  const error = ref(false);

  const errorText = ref("");

  const hooks = useReactive({ value, error, verification, verificat, unVerification, errorText })

  function verificat() {
    if (config.required === true) {
      if (config.requiredVerify(value.value)) return false;
    }

    if (config.regexp instanceof RegExp) {
      if (config.regexpVerify(config.regexp, value.value)) return false;
    }

    return config.customVerify(value.value);
  }

  function verification() {
    return new Promise(async (resolve, reject) => {
      if (config.required === true) {
        if (config.requiredVerify(value.value)) {
          config.onRequiredError(value, config);
          error.value = true;
          errorText.value = config.requiredMessage;
          return reject(config.requiredMessage);
        }
      }

      if (config.regexp instanceof RegExp) {
        if (config.regexpVerify(config.regexp, value.value)) {
          config.onRegexpError(value, config);
          error.value = true;
          errorText.value = config.regexpMessage;
          return reject(config.regexpMessage);
        }
      }

      const customVerifyRes = config.customVerify(value.value);
      if (customVerifyRes instanceof Promise) {
        await customVerifyRes.catch((err) => {
          error.value = true;
          errorText.value = err;
          console.log(err);
          reject(err);
          return Promise.reject(err);
        })
      }


      console.log('------------');
      resolve();
      error.value = false;
      errorText.value = "";
    });
  }

  function unVerification() {
    error.value = false;
    errorText.value = "";
  }

  return hooks;
}
