import { createOverlay } from "./components/popup";
import { arrayRemove } from "@rainbow_ljy/rainbow-js";

const zIndex = 300000;

function usezIndexQueue(props = {}) {
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

  function upZIndex() {
    queue.forEach((ele, index) => {
      ele?.setZIndex(zIndex + index * 2);
    });
  }

  function push(current) {
    if (queue.length === 0) options.onBegin(queue);
    options.onPush(queue);
    queue.push(current);
    upZIndex();
    options.onPushed(queue);
  }

  function change(current) {
    //
  }

  function remove(current) {
    options.onRemove(queue);
    arrayRemove(queue, current);
    upZIndex();
    options.onRemoved(queue);
    if (queue.length === 0) options.onFinish(queue);
  }

  return { queue, push, remove, change };
}

export const RGlobal = {
  scrolls: [],
  overlay: createOverlay(),
  zIndexQueue: usezIndexQueue(),
};
