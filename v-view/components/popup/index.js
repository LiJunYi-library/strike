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
import "./index.scss";
import { ROverlay } from "./overlay";

export * from "./overlay";

let prvePopup;

export const RPopup = defineComponent({
  props: {
    visible: Boolean,
    scrollController: Object,
    teleport: [Object, String],
    lazy: { type: Boolean, default: true },
    destroy: { type: Boolean, default: false },
    cache: { type: Boolean, default: true },
    closeOnClickOverlay: { type: Boolean, default: true },
    closeOnClickEmpty: { type: Boolean, default: true },
    left: { type: [Number, String], default: "" },
    right: { type: [Number, String], default: "" },
    top: { type: [Number, String], default: "" },
    bottom: { type: [Number, String], default: "" },
    position: { type: String, default: "bottom" }, // center top bottom right left
    popClass: { type: String, default: "" },
  },
  emits: [
    "beforeOpen",
    "open",
    "close",
    "update:visible",
    "opened",
    "closed",
    "prveClose",
    "currentClose",
  ],
  setup(props, context) {
    let lock = false;
    // eslint-disable-next-line
    let isRender = props.visible;
    const teleport = ref(resolveTeleport());
    const visible = ref(props.visible);
    watch(
      () => props.visible,
      () => {
        if (visible.value === props.visible) return;
        teleport.value = resolveTeleport();
        isRender = true;
        trigger();
      }
    );

    const ctx = { visible, close, open, emitClose, emitOpen, trigger, emitTrigger };

    const overlay = reactive({
      el: undefined,
      visible: props.visible,
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

    function resolveTeleport() {
      if (typeof props.teleport === "object") return props.teleport;
      return document.querySelector(props.teleport);
    }

    function trigger() {
      // console.log("trigger");
      if (!visible.value) open();
      else close();
    }

    function emitTrigger() {
      // console.log("emitTrigger");
      if (visible.value) emitOpen();
      else emitClose();
    }

    function open() {
      if (visible.value) return;
      // console.log("before open");
      context.emit("beforeOpen");
      if (prvePopup) {
        prvePopup.emitClose(true);
      }
      // console.log("open");
      context.emit("open");
      prvePopup = ctx;
      lock = true;
      isRender = true;
      overlay.visible = true;
      visible.value = true;
      props?.scrollController?.setCanScroll?.(false);
    }

    function close(isPrve) {
      if (!visible.value) return;
      overlay.visible = false;
      visible.value = false;
      prvePopup = undefined;
      context.emit("close");
      if (isPrve) context.emit("prveClose");
      else context.emit("currentClose");
      props?.scrollController?.setCanScroll?.(true);
    }

    function emitClose(isPrve) {
      close(isPrve);
      context.emit("update:visible", false);
    }

    function emitOpen() {
      open();
      context.emit("update:visible", true);
    }

    context.expose(ctx);

    function documentTouchstart(event) {
      if (!props.closeOnClickEmpty) return;
      if (!visible.value) return;
      // console.log("documentTouchstart");
      emitClose();
    }
    document.addEventListener("touchstart", documentTouchstart);
    onBeforeUnmount(() => {
      document.removeEventListener("touchstart", documentTouchstart);
    });

    function onAfterEnter(params) {
      // console.log("opened");
      context.emit("opened");
      lock = false;
    }

    function onAfterLeave(params) {
      context.emit("closed");
      if (props.destroy) content?.el?.remove();
    }

    function renderContent(cStyle) {
      if (!visible.value && !isRender && props.lazy) return null;
      if (!visible.value && !props.cache) return null;
      return (
        <div
          v-show={visible.value}
          onTouchstart={content.onTouchstart}
          onClick={content.onClick}
          class={["r-popup-content", `r-popup-content-${props.position}`]}
        >
          {renderSlot(context.slots, "default")}
        </div>
      );
    }

    return () => {
      const style = {
        left: props.left,
        right: props.right,
        top: props.top,
        bottom: props.bottom,
      };
      const cStyle = { ...style, zIndex: visible.value ? 2001 : 2000 };
      return [
        <ROverlay
          style={style}
          ref={(el) => (overlay.el = el)}
          onTouchstart={overlay.onTouchstart}
          onClick={overlay.onClick}
          teleport={props.teleport}
          visible={overlay.visible}
          onUpdate:visible={overlay.onUpdateVisible}
          lazy={props.lazy}
          cache={props.cache}
          destroy={props.destroy}
        ></ROverlay>,
        <Teleport to={teleport.value} disabled={!teleport.value}>
          <Transition name="popVisible" onAfterLeave={onAfterLeave} onAfterEnter={onAfterEnter}>
            <div
              ref={(el) => (content.el = el)}
              v-show={visible.value}
              class={["r-popup", `r-popup-${props.position}`, props.popClass]}
              style={cStyle}
            >
              <Transition name={"popup-" + props.position}>{renderContent(cStyle)}</Transition>
            </div>
          </Transition>
        </Teleport>,
      ];
    };
  },
});

export function useRPopup(node) {
  const div = document.createElement("div");
  if (node instanceof Function) {
    return new Promise((resolve, reject) => {
      node(resolve, reject);
    });
  }
  render(node, div);
  node.component.exposed.open();
}

useRPopup.create = (config = {}) => {
  let instance;
  const appContext = config.appContext;
  const div = document.createElement("div");

  function create(node) {
    if (!node.appContext) node.appContext = appContext;
    render(node, div);
    instance = node;
    node.component.exposed.open();
    create.close = node.component.exposed.close;
    create.trigger = node.component.exposed.trigger;
  }
  return create;
};

useRPopup.asyncCreate = (node) => {
  const obj = {};
  onMounted(() => {
    Object.assign(obj, useRPopup.create(node));
  });
  return obj;
};
