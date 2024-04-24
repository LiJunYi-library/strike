import { onMounted, onBeforeUnmount } from "vue";
import { timerDebounced } from "@rainbow_ljy/rainbow-js";

export function useResizeObserver(el, cb, time = false) {
  let resizeCallback = cb;

  if (typeof time === "number" && time >= 0) {
    resizeCallback = timerDebounced(cb, time);
  }

  let resizeObserver;
  try {
    resizeObserver = new ResizeObserver(resizeCallback);
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
