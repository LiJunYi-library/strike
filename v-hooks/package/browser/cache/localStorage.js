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

export function useLocalStorageRef(key, defaultValue, props = {}) {
  const config = { isListener: true, onChange: () => undefined, ...props };

  window.addEventListener("storage", onStorageChange);
  onBeforeUnmount(() => {
    window.removeEventListener("storage", onStorageChange);
  });

  const storageStr = window.localStorage.getItem(key);
  const storageVal = (() => {
    if (storageStr === "undefined") return undefined;
    if (storageStr === null) {
      if (defaultValue !== undefined) {
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
      }
      return defaultValue;
    }
    return JSON.parse(storageStr);
  })();

  const val = ref(storageVal);

  function onStorageChange(event) {
    if (event.key !== key) return;
    if (config.isListener) changeVal(event);
    config?.onChange?.(event);
  }

  function changeVal(event) {
    const str = window.localStorage.getItem(key);
    const sv = (() => {
      if (str === "undefined") return undefined;
      return JSON.parse(str);
    })();
    event._r_value = sv;
    val.value = sv;
  }

  watch(
    val,
    (newValue) => {
      const newVal = isRef(newValue) ? newValue.value : newValue;
      window.localStorage.setItem(key, JSON.stringify(newVal));
    },
    { deep: true }
  );

  return val;
}


// export function useLocalStorage(){

// }
