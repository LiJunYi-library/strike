import { onBeforeUnmount } from "vue";

export function useEventListener(element = document, type = "clcik", listener, options) {

  const fun = (...arg) => {
    if (listener) listener(...arg);
  };

  element.addEventListener(type, fun, options);

  onBeforeUnmount(() => {
    element.removeEventListener(type, fun, options);
  });

}


