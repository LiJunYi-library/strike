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
