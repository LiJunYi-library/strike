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

export function useResizeObserver(el, cb) {
  let resizeObserver;
  try {
    resizeObserver = new ResizeObserver(cb);
  } catch (error) {
    //
  }

  function getEl() {
    if (typeof el === "function") return el();
    if (el && el.value) return el.value;
    return el;
  }

  onMounted(() => {
    const ele = getEl();
    if (ele instanceof Array) {
      ele.forEach((item) => {
        if (item) resizeObserver?.observe?.(item);
      });
    } else {
      if (ele) resizeObserver?.observe?.(ele);
    }
  });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect?.();
  });

  return resizeObserver;
}

export function useLocalStorageRef(key, defaultValue) {
  window.addEventListener("storage", onStorageChange);
  // window.sessionStorage
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
    console.log("localStorage发生变化:", event);
    const str = window.localStorage.getItem(key);
    const sv = (() => {
      if (str === "undefined") return undefined;
      return JSON.parse(str);
    })();
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
