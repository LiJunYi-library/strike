import { onMounted, onBeforeUnmount } from "vue";
import { timerDebounced, animationDebounced } from "@rainbow_ljy/rainbow-js";

export function useResizeObserver(el, cb, time = false) {
  let resizeCallback = cb;

  if (typeof time === "number" && time >= 0) {
    resizeCallback = timerDebounced(cb, time);
  }

  if (time === true) {
    resizeCallback = animationDebounced(cb);
  }

  let resizeObserver;

  try {
    resizeObserver = new ResizeObserver(resizeCallback);
  } catch (error) {
    console.warn(error);
  }

  function getEl() {
    if (typeof el === "function") return el();
    if (el && el.value) return el.value;
    return el;
  }

  onMounted(() => {
    const ele = getEl();

    if (!ele) return;

    if (ele instanceof Array) {
      ele.filter(Boolean).forEach((item) => resizeObserver?.observe?.(item));
      return;
    }

    resizeObserver?.observe?.(ele);
  });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect?.();
  });

  if (!resizeObserver) {
    return {
      observe: () => undefined,
      disconnect: () => undefined,
    };
  }

  return resizeObserver;
}
