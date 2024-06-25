import { ref, computed } from "vue";
import { useReactive } from "../../other";

export function useForm(valueObj = {}, props = {}) {
  const config = {
    onVerifyError: () => undefined,
    ...props,
  };

  const value = computed(() => {
    const obj = {};
    for (const key in valueObj) {
      if (Object.hasOwnProperty.call(valueObj, key)) {
        obj[key] = valueObj[key]?.value;
      }
    }
    return obj
  })

  const errors = computed(() => {
    const obj = {};
    for (const key in valueObj) {
      if (Object.hasOwnProperty.call(valueObj, key)) {
        if (valueObj[key]?.error) obj[key] = valueObj[key];
      }
    }
    return obj
  })

  const errorList = computed(() => {
    const list = [];
    for (const key in valueObj) {
      if (Object.hasOwnProperty.call(valueObj, key)) {
        if (valueObj[key]?.error) list.push(valueObj[key]);
      }
    }
    return list
  })

  const hooks = useReactive({ value, verification, errors, errorList })

  async function verification() {
    const pros = [];
    for (const key in valueObj) {
      if (Object.hasOwnProperty.call(valueObj, key)) {
        pros.push(valueObj[key]?.verification?.());
      }
    }
    await Promise.all(pros).catch((err) => {
      config.onVerifyError(err);
      return Promise.reject(err)
    })
  }



  return hooks;
}
