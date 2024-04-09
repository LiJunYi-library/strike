import {
  defineComponent,
  renderSlot,
  watch,
  provide,
  inject,
  onMounted,
  ref,
  computed,
  isRef,
  render,
  onBeforeUnmount,
  Teleport,
  reactive,
  Transition,
} from "vue";
import { arrayRemove } from "@rainbow_ljy/rainbow-js";
import { RGlobal } from "../../global";

export function useDialogQueue(props = {}) {
  const options = {
    onBegin: () => undefined,
    onFinish: () => undefined,
    onPush: () => undefined,
    onRemove: () => undefined,
    onPushed: () => undefined,
    ...props,
  };
  const queue = [];

  function push(current) {
    const prve = queue.at(-1);
    if (queue.length === 0) options.onBegin(prve, current);
    options.onPush(prve, current);
    queue.push(current);
    options.onPushed(prve, current);
  }

  function del(current) {
    arrayRemove(queue, current);
    const prve = queue.at(-1);
    options.onRemove(prve, current);
  }

  function remove(current) {
    arrayRemove(queue, current);
    const prve = queue.at(-1);
    options.onRemove(prve, current);
    if (queue.length === 0) options.onFinish(prve, current);
  }

  return { queue, push, remove, del };
}

function useDocumentTouchstart(cb) {
  document.addEventListener("touchstart", cb);
  onBeforeUnmount(() => {
    document.removeEventListener("touchstart", cb);
  });
}

let dialogZIndex = 300000;

export const RDialogHoc = (options = {}) => {
  const config = {
    class: "",
    overlayClass: "",
    props: {},
    renderDefault: (props, context, ctx) => {
      return renderSlot(context.slots, "default", ctx);
    },
    renderOverlayContent: () => {
      return null;
    },
    emits: [],
    dialogQueue: [],
    ...options,
  };
  return defineComponent({
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
      overlayClass: { type: String, default: "" },
      ...config.props,
    },
    emits: [
      "beforeOpen",
      "open",
      "opened",
      "close",
      "closed",
      "prveClose",
      "currentClose",
      "click",
      "contentClick",
      "update:visible",
      ...config.emits,
    ],
    setup(props, context) {
      dialogZIndex = dialogZIndex + 1;
      const zIndex = ref(dialogZIndex);
      const visible = ref(props.visible);
      const slots = context.slots;
      const { renderOverlayContent } = config;
      let isRender = false;
      let ele;
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
          props.visible ? onOpen() : onClose();
        }
      );
      useDocumentTouchstart(onDocumentTouchstart);

      const ctx = {
        visible,
        close,
        open,
        strengthenZIndex,
        weakenZIndex,
        zIndex,
        teleport,
        slots,
        renderOverlayContent,
        currentClose,
        onOverlayClick,
      };

      provide("RPopupContext", ctx);

      function strengthenZIndex() {
        zIndex.value = zIndex.value + 100000;
      }

      function weakenZIndex() {
        zIndex.value = zIndex.value - 100000;
      }

      function onDocumentTouchstart() {
        if (!props.closeOnClickEmpty) return;
        if (!visible.value) return;
        close();
      }

      function onOpen() {
        // console.log("onOpen");
        context.emit("beforeOpen");
        config.dialogQueue.push(ctx);
        context.emit("open", ctx);
        props?.scrollController?.setCanScroll?.(false);
      }

      function onClose() {
        context.emit("close", ctx);
        // console.log("onClose");
        config.dialogQueue.remove(ctx);
        props?.scrollController?.setCanScroll?.(true);
      }

      function currentClose() {
        context.emit("currentClose", ctx);
        // console.log("onCurrentClose");
      }

      function close() {
        visible.value = false;
        context.emit("update:visible", false);
        onClose();
      }

      function onOverlayClick() {
        if (props.closeOnClickOverlay) close();
      }

      function open() {
        visible.value = true;
        context.emit("update:visible", true);
        onOpen();
      }

      function onClick(event) {
        context.emit("click", event);
        context.emit("contentClick", event);
      }

      function onTouchstart(event) {
        event.stopPropagation();
      }

      function onAfterEnter(...params) {
        context.emit("opened", ...params);
        // console.log("onopened");
      }

      function onAfterLeave(...params) {
        context.emit("closed", ...params);
        // console.log("onclosed");
        if (props.destroy) ele?.remove?.();
      }

      context.expose(ctx);

      function renderContent() {
        if (!visible.value && props.lazy && !isRender) return null;
        if (!visible.value && !props.cache) return null;
        isRender = true;
        return (
          <div
            v-show={visible.value}
            class={["r-popup-content", `r-popup-content-${props.position}`]}
          >
            {config.renderDefault(props, context, ctx)}
          </div>
        );
      }

      const style = computed(() => ({
        left: props.left,
        right: props.right,
        top: props.top,
        bottom: props.bottom,
        zIndex: zIndex.value,
      }));

      ctx.style = style;

      return (vm) => {
        ctx.vm = vm;
        return [
          <Teleport to={teleport.value} disabled={!teleport.value}>
            <Transition
              name={"popup-" + props.position}
              onAfterLeave={onAfterLeave}
              onAfterEnter={onAfterEnter}
            >
              <div
                ref={(el) => (ele = el)}
                onTouchstart={onTouchstart}
                onClick={onClick}
                v-show={visible.value}
                class={["r-popup", `r-popup-${props.position}`, config.class, props.popClass]}
                style={style.value}
              >
                <Transition name={"popup-content-" + props.position}>{renderContent()}</Transition>
              </div>
            </Transition>
          </Teleport>,
        ];
      };
    },
  });
};

const dialogQueue = useDialogQueue({
  onPush(prve, current) {
    const teleport = current?.teleport?.value || current?.vm?.$el?.parentElement || document.body;
    const { renderOverlayContent, slots, style, onOverlayClick } = current;
    prve?.weakenZIndex?.();
    RGlobal.overlay.show({
      teleport,
      slots,
      renderOverlayContent,
      overlayStyle: style?.value,
      onClick: onOverlayClick,
    });
  },
  onRemove(prve, current) {
    if (!prve) return;
    const teleport = prve?.teleport?.value || prve?.vm?.$el?.parentElement || document.body;
    const { renderOverlayContent, slots, style, onOverlayClick } = prve;
    prve?.strengthenZIndex?.();
    RGlobal.overlay.show({
      teleport,
      slots,
      renderOverlayContent,
      overlayStyle: style?.value,
      onClick: onOverlayClick,
    });
  },
  onFinish() {
    RGlobal.overlay.hide();
  },
});

export const RDialog = RDialogHoc({ dialogQueue });

export function useRDialog(node) {
  const div = document.createElement("div");

  if (node instanceof Function) {
    return new Promise((resolve, reject) => {
      const VNode = node(resolve, reject);
      render(VNode, div);
      VNode.component.exposed.open();
    });
  }

  render(node, div);
  node.component.exposed.open();
}

useRDialog.create = (config = {}) => {
  let instance;
  const appContext = config.appContext;
  const div = config.RendererElement || document.createElement("div");

  function create(node) {
    if (!node.appContext) node.appContext = appContext;
    render(node, div);
    instance = node;
    node.component.exposed.open();
    create.close = node.component.exposed.close;
  }
  return create;
};
