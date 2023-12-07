import {
  defineComponent,
  renderSlot,
  computed,
  onMounted,
  onBeforeUnmount,
  inject,
  reactive,
  provide,
} from "vue";

export function useResizeObserver(el, cb) {
  let resizeObserver;
  try {
    resizeObserver = new ResizeObserver(cb);
  } catch (error) {}

  function getEl() {
    if (typeof el === "function") return el();
    if (el.value) return el.value;
    return el;
  }

  onMounted(() => {
    if (getEl()) resizeObserver?.observe?.(getEl());
  });

  onBeforeUnmount(() => {
    if (getEl()) resizeObserver?.unobserve?.(getEl());
    resizeObserver?.disconnect?.();
  });

  return resizeObserver
}
