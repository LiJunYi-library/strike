import {
  defineComponent,
  renderSlot,
  computed,
  onMounted,
  onBeforeUnmount,
  inject,
  reactive,
  ref,
  customRef,
  watch,
  isRef,
} from "vue";


export function useSessionStorageRef(key, defaultValue, props = {}) {
  const config = { isListener: true, onChange: () => undefined, ...props };

  const storageStr = window.sessionStorage.getItem(key);
  const storageVal = (() => {
    if (storageStr === "undefined") return undefined;
    if (storageStr === null) {
      if (defaultValue !== undefined) {
        window.sessionStorage.setItem(key, JSON.stringify(defaultValue));
      }
      return defaultValue;
    }
    return JSON.parse(storageStr);
  })();

  const val = ref(storageVal);

  watch(
    val,
    (newValue) => {
      const newVal = isRef(newValue) ? newValue.value : newValue;
      window.sessionStorage.setItem(key, JSON.stringify(newVal));
    },
    { deep: true }
  );

  return val;
}


