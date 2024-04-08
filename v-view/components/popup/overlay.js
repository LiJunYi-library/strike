import { defineComponent, renderSlot, watch, ref, Teleport, Transition } from "vue";

import "./index.scss";

export const ROverlay = defineComponent({
  props: {
    visible: { type: Boolean, default: false },
    teleport: [Object, String],
    lazy: { type: Boolean, default: true },
    cache: { type: Boolean, default: true },
    destroy: { type: Boolean, default: false },
    OverlayStyle: [Object, String],
    overlayClass: { type: String, default: "" },
  },
  emits: ["update:visible", "update:visible", "closed", "touchstart", "click"],
  setup(props, context) {
    const visible = ref(props.visible);
    // eslint-disable-next-line
    let isRender = props.visible;
    let el;
    const teleport = ref(resolveTeleport());

    watch(
      () => props.visible,
      () => {
        if (visible.value === props.visible) return;
        visible.value = props.visible;
        isRender = true;
        teleport.value = resolveTeleport();
      }
    );

    function resolveTeleport() {
      if (typeof props.teleport === "object") return props.teleport;
      return document.querySelector(props.teleport);
    }

    function close() {
      visible.value = false;
      context.emit("update:visible", false);
      isRender = true;
    }

    function open() {
      visible.value = true;
      context.emit("update:visible", true);
      isRender = true;
    }

    function onAfterLeave() {
      context.emit("closed");
      if (props.destroy) el?.remove();
    }

    context.expose({ visible, close, open });

    function renderContent() {
      if (!visible.value && !isRender && props.lazy) return null;
      if (!visible.value && !props.cache) return null;
      return (
        <div
          v-show={visible.value}
          class={["r-overlay", props.overlayClass]}
          ref={(ele) => (el = ele)}
          {...context.attrs}
          style={props.OverlayStyle}
        >
          {renderSlot(context.slots, "default")}
        </div>
      );
    }

    return () => {
      return (
        <Teleport to={teleport.value} disabled={!teleport.value}>
          <Transition name="overlay" onAfterLeave={onAfterLeave}>
            {renderContent()}
          </Transition>
        </Teleport>
      );
    };
  },
});
