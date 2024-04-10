import { defineComponent, renderSlot, inject, render } from "vue";
import { RGlobal } from "../../global";
import { RDialogHoc } from "./dialog";

export const RPopupHoc = (options = {}) =>
  RDialogHoc({
    createOpen({ visible, context, ctx, renderOverlay, props }) {
      function open(isEmit = true) {
        const prve = RGlobal.zIndexQueue.queue.at(0);
        if (prve) prve?.close?.();
    
        visible.value = true;
        if (isEmit) context.emit("update:visible", true);
        // console.log("onOpen");
        context.emit("beforeOpen");
        RGlobal.zIndexQueue.push(ctx);
        context.emit("open", ctx);
        renderOverlay();
        props?.scrollController?.setCanScroll?.(false);
        RGlobal.scrolls.forEach((el) => el?.setCanScroll?.(false));
      }
      return open;
    },

    ...options,
  });

export const RPopup = RPopupHoc({});

export function useRPopup(node) {
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

useRPopup.create = (config = {}) => {
  let instance;
  const appContext = config.appContext;
  const div = config.RendererElement || document.createElement("div");

  function handleVNode(VNode) {
    if (!VNode.appContext) VNode.appContext = appContext;
    render(VNode, div);
    instance = VNode;
    VNode.component.exposed.open();
    create.close = VNode.component.exposed.close;
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

export const RPopupClose = defineComponent({
  setup(props, context) {
    const RPopupContext = inject("RPopupContext") || {};

    function onclick(params) {
      RPopupContext?.close?.();
    }

    return () => {
      return <div onclick={onclick}>{renderSlot(context.slots, "default", RPopupContext)}</div>;
    };
  },
});
