import { onBeforeUnmount } from "vue";

export function useSetInterval(callback, ms) {
  const timer = setInterval(callback, ms);
  onBeforeUnmount(() => {
    clearInterval(timer);
  });
  return timer
}

export function useSetTimeout(callback, ms) {
  const timer = setTimeout(callback, ms);
  onBeforeUnmount(() => {
    clearTimeout(timer);
  });
  return timer
}
