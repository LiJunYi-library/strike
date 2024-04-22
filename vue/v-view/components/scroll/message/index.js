import { defineComponent, ref, onBeforeUnmount, computed, Transition, renderSlot } from "vue";
import "./index.scss";
import { useScrollController } from "../";

export const RScrollMessage = defineComponent({
  props: {
    top: [Number, String],
    bottom: [Number, String],
    left: [Number, String],
    right: [Number, String],
    zIndex: [Number, String],
    once: { type: Boolean, default: true },
    position: { type: String, default: "bottom" }, // center top bottom right left
    visibleTop: Number,
  },
  setup(props, context) {
    const visible = ref(false);
    let isRender = false;

    useScrollController({
      type: "message",
      onScroll(event, sTop) {
        if (visible.value) return;
        if (isRender) return;
        if (sTop >= props.visibleTop) {
          visible.value = true;
          isRender = true;
          context.emit("show");
        }
      },
    });

    function open() {
      visible.value = true;
    }

    function close() {
      visible.value = false;
    }

    const ctx = { visible, open, close };

    context.expose(ctx);

    function renderContent() {
      if (!visible.value) return null;
      return (
        <div
          v-show={visible.value}
          class="r-scroll-message"
          style={{
            top: props.top + "px",
            bottom: props.bottom + "px",
            left: props.left + "px",
            right: props.right + "px",
            zIndex: props.zIndex,
          }}
        >
          {renderSlot(context.slots, "default", ctx)}
        </div>
      );
    }

    function onAfterLeave() {
      context.emit("closed", ctx);
    }

    function onAfterEnter() {
      context.emit("opened", ctx);
    }

    return (v) => {
      return (
        <Transition
          name={"r-scroll-message-" + props.position}
          onAfterLeave={onAfterLeave}
          onAfterEnter={onAfterEnter}
        >
          {renderContent()}
        </Transition>
      );
    };
  },
});
