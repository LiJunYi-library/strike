import { defineComponent, renderSlot, inject, render } from "vue";
import { RGlobal } from "../../global";
import { RDialogHoc } from "./dialog";

export const RPopupHoc = (options = {}) =>
  RDialogHoc({
    open(ctx) {
      const prve = RGlobal.popupQueue.queue.at(0);
      RGlobal.popupQueue.push(ctx);
      if (prve) prve?.close?.();
    },
    close(ctx) {
      RGlobal.popupQueue.remove(ctx);
    },
    beforeUnmount(ctx) {
      RGlobal.popupQueue.remove(ctx);
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
