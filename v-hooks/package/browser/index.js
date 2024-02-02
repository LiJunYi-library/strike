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
  const localStorageStr = window.localStorage.getItem(key);
  const localStorageVal = (() => {
    if (localStorageStr === "undefined") return undefined;
    if (localStorageStr === null) {
      if (defaultValue !== undefined) {
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
      }
      return defaultValue;
    }
    return JSON.parse(localStorageStr);
  })();

  const val = ref(localStorageVal);

  watch(
    val,
    (newValue) => {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    },
    { deep: true }
  );
  
  return val;
}
