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

export const ROverlay = defineComponent({
  props: {
    loadingClass: String,
    skelectonClass: String,
    visible: { type: Boolean, default: false },
    closeOnClickOverlay: { type: Boolean, default: true },
  },
  setup(props, context) {
    console.log("props", props);
    const visible = ref(props.visible);

    function close() {
      visible.value = false;
      //   context.emit("update:visible", false);
      console.log("visible", visible);
    }

    function documentTouchstart(event) {
      console.log("documentTouchstart");
      close();
    }

    console.log("ROverlay 创建");

    document.addEventListener("touchstart", documentTouchstart);
    onBeforeUnmount(() => {
      document.removeEventListener("touchstart", documentTouchstart);
    });

    function onTouchstart(event) {
      event.stopPropagation();
    }

    context.expose({ visible, close });
    return () => {
      console.log("visible", visible);
      return (
        <Teleport to="body">
          <div
            v-show={visible.value}
            onTouchstart={onTouchstart}
            class={["r-overlay"]}
            style={{ top: "200px" }}
          >
            {renderSlot(context.slots, "default")}
          </div>
        </Teleport>
      );
    };
  },
});
