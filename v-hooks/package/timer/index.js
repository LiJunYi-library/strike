import { onBeforeUnmount } from "vue";

export function useSetInterval(callback, ms) {
  let timer = setInterval(callback, ms);
  onBeforeUnmount(() => {
    clearInterval(timer);
  });
  return timer
}

export function useSetTimeout(callback, ms) {
  let timer = setTimeout(callback, ms);
  onBeforeUnmount(() => {
    clearTimeout(timer);
  });
  return timer
}
