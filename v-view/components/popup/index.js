import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  watch,
  onMounted,
  ref,
  render,
  nextTick,
  withMemo,
  isMemoSame,
  onBeforeUnmount,
  Teleport,
} from "vue";
import { RILoading } from "../icon";
import "./index.scss";

import { ROverlay } from "./overlay";

export const RPopup = defineComponent({
  props: {
    loadingClass: String,
    skelectonClass: String,
    visible: Object,
    closeOnClickOverlay: { type: Boolean, default: true },
  },
  setup(props, context) {
    // van-overlay
    const visible = ref(true);

    function close() {
      visible.value = false;
      //   context.emit("update:visible", false);
      console.log("visible", visible);
    }

    // function documentTouchstart(event) {
    //   console.log("documentTouchstart");
    // }

    // document.addEventListener("touchstart", documentTouchstart);
    // onBeforeUnmount(() => {
    //   document.removeEventListener("touchstart", documentTouchstart);
    // });

    // const overlay = {
    //   onTouchstart(event) {
    //     event.stopPropagation();
    //   },
    // };

    // const content = {
    //   onTouchstart(event) {
    //     event.stopPropagation();
    //   },
    // };

    function onTouchstart(event) {
      event.stopPropagation();
    }

    context.expose({ visible, close });
    return () => {
      return (
        <ROverlay visible={props.visible}>
          <div onTouchstart={onTouchstart} class={["r-popup-content"]}>
            {renderSlot(context.slots, "default")}
          </div>
        </ROverlay>
      );
    };
  },
});
