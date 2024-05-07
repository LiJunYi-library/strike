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

function useDocumentTouchstart(cb) {
  document.addEventListener("touchstart", cb);
  onBeforeUnmount(() => {
    document.removeEventListener("touchstart", cb);
  });
}

const dialogZIndex = 300000;

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
    beforeOpen: () => undefined,
    open: () => undefined,
    beforeClose: () => undefined,
    close: () => undefined,
    beforeUnmount: () => undefined,
    emits: [],
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
      "beforeClose",
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
      const zIndex = ref(dialogZIndex);
      const visible = ref(false);
      const slots = context.slots;
      const { renderOverlayContent } = config;
      let isRender = false;
      let ele;

      const teleport = computed(() => {
        if (isRef(props.teleport)) return props.teleport.value;
        if (typeof props.teleport === "object") return props.teleport;
        return document.querySelector(props.teleport);
      });

      const style = computed(() => ({
        left: props.left,
        right: props.right,
        top: props.top,
        bottom: props.bottom,
        zIndex: zIndex.value,
      }));

      const ctx = {
        props,
        config,
        visible,
        zIndex,
        teleport,
        slots,
        style,
        open,
        close,
        renderOverlayContent,
        currentClose,
        onOverlayClick,
        setZIndex,
        renderOverlay,
      };
      provide("RPopupContext", ctx);

      watch(
        () => props.visible,
        (newVal) => {
          if (visible.value === newVal) return;
          newVal ? open(false) : close(false);
        }
      );

      useDocumentTouchstart(onDocumentTouchstart);

      if (props.visible) open(false);

      function renderOverlay() {
        RGlobal.overlay.renderOverlay({
          teleport: ctx?.teleport?.value || ctx?.vm?.$el?.parentElement || document.body,
          overlayClass: [ctx?.props.overlayClass, ctx?.config.overlayClass],
          slots: ctx?.slots,
          renderOverlayContent: ctx?.renderOverlayContent,
          onClick: ctx?.onOverlayClick,
          visible: ctx?.visible?.value,
          zIndex: ctx?.zIndex?.value - 1,
          overlayStyle: ctx?.style?.value,
        });
      }

      function open(isEmit = true) {
        config.beforeOpen(ctx);
        context.emit("beforeOpen");
        visible.value = true;
        if (isEmit) context.emit("update:visible", true);
        // console.log("onOpen");
        RGlobal.zIndexQueue.push(ctx);
        RGlobal.overlayQueue.push(ctx);
        RGlobal.disabledScrollQueue.push(ctx);
        config.open(ctx);
        context.emit("open", ctx);
        renderOverlay();
        props?.scrollController?.setCanScroll?.(false);
      }

      function close(isEmit = true) {
        config.beforeClose(ctx);
        context.emit("beforeClose", ctx);
        visible.value = false;
        if (isEmit) context.emit("update:visible", false);
        context.emit("close", ctx);
        RGlobal.zIndexQueue.remove(ctx);
        RGlobal.overlayQueue.remove(ctx);
        config.close(ctx);
        props?.scrollController?.setCanScroll?.(true);
        const last = RGlobal.overlayQueue.queue.at(-1);
        last ? last.renderOverlay() : renderOverlay();
      }

      onBeforeUnmount(() => {
        RGlobal.zIndexQueue.remove(ctx);
        RGlobal.overlayQueue.remove(ctx);
        RGlobal.disabledScrollQueue.remove(ctx);
        config.beforeUnmount(ctx);
      });

      function setZIndex(_zIndex) {
        zIndex.value = _zIndex;
      }

      function onDocumentTouchstart() {
        if (!props.closeOnClickEmpty) return;
        if (!visible.value) return;
        // console.log("onDocumentTouchstart");
        close();
      }

      function currentClose() {
        context.emit("currentClose", ctx);
        console.log("onCurrentClose");
      }

      function onOverlayClick() {
        if (props.closeOnClickOverlay) close();
      }

      function onClick(event) {
        event.stopPropagation();
        context.emit("click", event);
        context.emit("contentClick", event);
      }

      function onTouchstart(event) {
        event.stopPropagation();
      }

      function onAfterEnter(...params) {
        context.emit("opened", ...params);
      }

      function onAfterLeave(...params) {
        context.emit("closed", ...params);
        RGlobal.disabledScrollQueue.remove(ctx);
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

export const RDialog = RDialogHoc();

export function useRDialog(node) {
  const div = document.createElement("div");
  if (node instanceof Function) {
    return new Promise((resolve, reject) => {
      const VNode = node(resolve, reject);
      render(VNode, div);
      VNode?.component?.exposed?.open?.();
    });
  }
  render(node, div);
  node?.component?.exposed?.open?.();
}

useRDialog.create = (config = {}) => {
  let instance;
  const appContext = config.appContext;
  const div = config.RendererElement || document.createElement("div");

  function handleVNode(VNode) {
    if (!VNode.appContext) VNode.appContext = appContext;
    render(VNode, div);
    instance = VNode;
    VNode?.component?.exposed?.open?.();
    create.close = VNode?.component?.exposed?.close;
  }

  function create(node) {
    if (node instanceof Function) {
      return new Promise((resolve, reject) => {
        const VNode = node(resolve, reject);
        handleVNode(VNode);
      });
    }

    handleVNode(node);
  }

  return create;
};
