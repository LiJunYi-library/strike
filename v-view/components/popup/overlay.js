import {
  defineComponent,
  computed,
  renderSlot,
  watch,
  ref,
  Teleport,
  Transition,
  render,
  isRef,
} from "vue";

export const ROverlay = defineComponent({
  props: {
    slots: { type: Object, default: () => ({}) },
    RendererElement: [Object, String],
    visible: { type: Boolean, default: false },
    teleport: [Object, String],
    lazy: { type: Boolean, default: true },
    cache: { type: Boolean, default: true },
    destroy: { type: Boolean, default: false },
    overlayStyle: [Object, String],
    overlayClass: { type: [String, Array], default: "" },
    isTouchStopPropagation: { type: Boolean, default: true },
    isClickStopPropagation: { type: Boolean, default: true },
    renderOverlayContent: { type: Function, default: () => null },
    zIndex: [Number, String],
  },
  emits: ["update:visible", "update:visible", "closed", "touchstart", "click"],
  setup(props, context) {
    console.log("ROverlay 创建", props);

    const visible = ref(props.visible);
    let isRender = false;
    const teleport = computed(() => {
      if (isRef(props.teleport)) return props.teleport.value;
      if (typeof props.teleport === "object") return props.teleport;
      return document.querySelector(props.teleport);
    });

    watch(
      () => props.visible,
      () => {
        if (visible.value === props.visible) return;
        visible.value = props.visible;
      }
    );

    const ctx = { visible, close, open };

    function close() {
      visible.value = false;
      context.emit("update:visible", false);
    }

    function open() {
      visible.value = true;
      context.emit("update:visible", true);
    }

    function onAfterLeave() {
      context.emit("closed");
    }

    function onTouchstart(event) {
      if (props.isTouchStopPropagation) event.stopPropagation();
      context.emit("touchstart", event, ctx);
    }

    function onClick(event) {
      if (props.isClickStopPropagation) event.stopPropagation();
      context.emit("click", event, ctx);
    }

    function renderContent() {
      if (!visible.value && props.lazy && !isRender) return null;
      if (!visible.value && !props.cache) return null;
      isRender = true;
      return (
        <div
          v-show={visible.value}
          class={["r-overlay", props.overlayClass]}
          onTouchstart={onTouchstart}
          onClick={onClick}
          style={{ ...props.overlayStyle, zIndex: props.zIndex || 300000 }}
        >
          {renderSlot(context.slots, "default")}
          {renderSlot(props.slots, "overlayContent")}
          {props.renderOverlayContent(props, context, ctx)}
        </div>
      );
    }

    context.expose(ctx);

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

export function createOverlay() {
  const div = document.createElement("div");
  let node = <ROverlay></ROverlay>;
  render(node, div);

  function show(config = {}) {
    const props = {
      RendererElement: div,
      ...config,
    };

    node = <ROverlay {...props}></ROverlay>;
    render(node, props.RendererElement);
    node.component.exposed.open();
  }

  function hide() {
    node.component.exposed.close();
  }

  function renderOverlay(config = {}) {
    const props = {
      RendererElement: div,
      ...config,
    };
    node = <ROverlay {...props}></ROverlay>;
    render(node, props.RendererElement);
  }

  return { show, hide, renderOverlay };
}
