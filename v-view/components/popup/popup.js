import { defineComponent, renderSlot, inject, render } from "vue";
import { RGlobal } from "../../global";
import { RDialogHoc, useDialogQueue } from "./dialog";

const dialogQueue = useDialogQueue({
  onPushed(prve, current) {
    const teleport = current?.teleport?.value || current?.vm?.$el?.parentElement || document.body;
    const { renderOverlayContent, slots, style, onOverlayClick, props, config } = current;
    const overlayClass = [props.overlayClass, config.overlayClass];
    current?.strengthenZIndex?.();
    prve?.weakenZIndex?.();
    prve?.close?.();
    RGlobal.overlay.show({
      teleport,
      slots,
      overlayClass,
      overlayStyle: style?.value,
      renderOverlayContent,
      onClick: onOverlayClick,
    });
  },

  onFinish(prve, current) {
    current?.weakenZIndex?.();
    current?.currentClose?.();
    RGlobal.overlay.hide();
  },
});

export const RPopupHoc = (options = {}) => RDialogHoc({ dialogQueue, ...options });

export const RPopup = RPopupHoc({ dialogQueue });

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

  function create(node) {
    if (!node.appContext) node.appContext = appContext;
    render(node, div);
    instance = node;
    node.component.exposed.open();
    create.close = node.component.exposed.close;
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
