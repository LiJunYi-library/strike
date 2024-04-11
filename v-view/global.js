import { createOverlay } from "./components/popup";
import { arrayRemove } from "@rainbow_ljy/rainbow-js";

const zIndex = 300000;

function useQueue(props = {}) {
  const options = {
    onBegin: () => undefined,
    onFinish: () => undefined,
    onPush: () => undefined,
    onPushed: () => undefined,
    onRemove: () => undefined,
    onRemoved: () => undefined,
    ...props,
  };

  const queue = [];

  function push(current) {
    if (queue.length === 0) options.onBegin(queue, current);
    options.onPush(queue, current);
    queue.push(current);
    options.onPushed(queue, current);
  }

  function change(current) {
    //
  }

  function remove(current) {
    options.onRemove(queue, current);
    arrayRemove(queue, current);
    options.onRemoved(queue, current);
    if (queue.length === 0) options.onFinish(queue, current);
  }

  return { queue, push, remove, change };
}

function upZIndex(queue) {
  queue.forEach((ele, index) => {
    ele?.setZIndex?.(zIndex + index * 2);
  });
}

export const RGlobal = {
  scrolls: [],
  overlay: createOverlay(),
  zIndexQueue: useQueue({ onPushed: upZIndex, onRemoved: upZIndex }),
  overlayQueue: useQueue(),
  popupQueue: useQueue({
    onFinish(queue, current) {
      current.currentClose();
    },
  }),
};
