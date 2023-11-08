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
  reactive,
  Transition,
} from "vue";
import { RILoading } from "../icon";
import "./index.scss";
import { ROverlay } from "./overlay";

let prvePopup;

export const RPopup = defineComponent({
  props: {
    visible: Object,
    closeOnClickOverlay: { type: Boolean, default: true },
    left: { type: [Number, String], default: "0" },
    top: { type: [Number, String], default: "0" },
  },
  emits: ["beforeOpen", "open", "close", "update:visible", "opened", "closed"],
  setup(props, context) {
    const visible = ref(props.visible);
    watch(
      () => props.visible,
      () => {
        if (visible.value === props.visible) return;
        visible.value = props.visible;
        if (visible.value) open();
        else close();
      }
    );

    const ctx = { visible, close, open, emitClose, emitOpen };

    const overlay = reactive({
      el: undefined,
      visible: false,
      onUpdateVisible(val) {
        overlay.visible = val;
      },
      onTouchstart(event) {
        event.stopPropagation();
      },
      onClick(event) {
        event.stopPropagation();
        if (props.closeOnClickOverlay) emitClose();
      },
    });

    const content = reactive({
      visible: false,
      onTouchstart(event) {
        event.stopPropagation();
      },
      onClick(event) {
        event.stopPropagation();
      },
    });

    function open() {
      console.log("before open");
      context.emit("beforeOpen");
      if (prvePopup) prvePopup.emitClose();
      console.log("open");
      context.emit("open");
      prvePopup = ctx;
      overlay.visible = true;
      visible.value = true;
    }

    function close() {
      overlay.visible = false;
      visible.value = false;
      prvePopup = undefined;
      console.log("close");
      context.emit("close");
    }

    function emitClose() {
      close();
      context.emit("update:visible", false);
    }

    function emitOpen() {
      open();
      context.emit("update:visible", true);
    }

    context.expose(ctx);

    function documentTouchstart(event) {
      if (!visible.value) return;
      // console.log("documentTouchstart");
      emitClose();
    }
    document.addEventListener("touchstart", documentTouchstart);
    onBeforeUnmount(() => {
      document.removeEventListener("touchstart", documentTouchstart);
    });

    function onAfterEnter(params) {
      console.log("opened");
      context.emit("opened");
    }

    function onAfterLeave(params) {
      context.emit("closed");
    }

    return () => {
      return [
        <ROverlay
          style={{ left: props.left, top: props.top }}
          ref={(el) => (overlay.el = el)}
          onTouchstart={overlay.onTouchstart}
          onClick={overlay.onClick}
          visible={overlay.visible}
          onUpdate:visible={overlay.onUpdateVisible}
        ></ROverlay>,
        <Transition name="popVisible" onAfterLeave={onAfterLeave} onAfterEnter={onAfterEnter}>
          <div
            v-show={visible.value}
            class={["r-popup"]}
            style={{ left: props.left, top: props.top, zIndex: visible.value ? 2001 : 2000 }}
          >
            <Transition name="popup">
              {visible.value && (
                <div
                  ref={(el) => (content.el = el)}
                  onTouchstart={content.onTouchstart}
                  onClick={content.onClick}
                  class={["r-popup-content"]}
                >
                  {renderSlot(context.slots, "default")}
                </div>
              )}
            </Transition>
          </div>
        </Transition>,
      ];
    };
  },
});
