import { createOverlay } from "./components/popup";
import { useQueue } from "@rainbow_ljy/rainbow-js";

const zIndex = 300000;

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
  disabledScrollQueue: useQueue({
    onBegin() {
      RGlobal.scrolls.forEach((el) => el?.setCanScroll?.(false));
    },
    onFinish(queue, current) {
      RGlobal.scrolls.forEach((el) => el?.setCanScroll?.(true));
    },
  }),
};
