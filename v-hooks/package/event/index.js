import { onBeforeUnmount } from "vue";

export function useEventListener(element, type = "click", listener, options) {
  const fun = (...arg) => {
    if (listener) listener(...arg);
  };

  element.addEventListener(type, fun, options);

  onBeforeUnmount(() => {
    element.removeEventListener(type, fun, options);
  });
}

useEventListener.doc = (...arg) => {
  useEventListener(document, ...arg);
};

useEventListener.docClick = (...arg) => {
  useEventListener(document, "click", ...arg);
};

export function useIntersectionObserver(props = {}) {
  const config = {
    element: null,
    intersectionoptions: {},
    firstIntersectionCb: () => undefined,
    intersectionCb: () => undefined,
    ...props,
  };

  let observe;
  let isIntersecting = false;
  const options = {
    threshold: 0.2,
    ...config.intersectionoptions,
  };
  try {
    observe = new IntersectionObserver(([entries]) => {
      if (entries.isIntersecting) {
        if (!isIntersecting) {
          config.firstIntersectionCb(entries);
          isIntersecting = true;
        }
        config.intersectionCb(entries);
      }
    }, options);
  } catch (error) {
    //
  }

  onBeforeUnmount(() => {
    const el = config.element;
    if (observe && el) observe.unobserve(el);
    if (observe) observe.disconnect();
  });
  return observe;
}

useIntersectionObserver.ob = (element, intersectionCb, intersectionoptions) => {
  return useIntersectionObserver({ element, intersectionCb, intersectionoptions });
};
