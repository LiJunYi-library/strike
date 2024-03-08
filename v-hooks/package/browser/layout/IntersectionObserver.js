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

export function useIntersectionObserver(props = {}) {
  const { el, intersectionConfig = {} } = props;

  const options = {
    threshold: 0.4,
    ...intersectionConfig,
  };

  let observer;
  let isFirstVisible = true;

  function observerCB(entries) {
    entries.forEach((entrie) => {
      props?.cb?.(entrie);
      if (entrie.isIntersecting) {
        props?.onIsIntersect?.(entrie);
        if (isFirstVisible) props?.onFirstIsIntersect?.(entrie);
        isFirstVisible = false;
      }
      if (!entrie.isIntersecting) props?.onUnIsIntersect?.(entrie);
    });
  }

  try {
    observer = new IntersectionObserver(observerCB, options);
  } catch (error) {
    console.error(error);
  }

  function getEl() {
    if (typeof el === "function") return el();
    if (isRef(el)) return el.value;
    return el;
  }

  onMounted(() => {
    const ele = getEl();
    if (ele instanceof Array) {
      ele.forEach((item) => {
        if (item) observer?.observe?.(item);
      });
    } else {
      if (ele) observer?.observe?.(ele);
    }
  });

  onBeforeUnmount(() => {
    observer?.disconnect?.();
  });

  return observer;
}
