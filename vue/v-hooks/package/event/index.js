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
