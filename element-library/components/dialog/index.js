import { defineComponent, render, renderSlot } from "vue";
import { ElDialog } from "element-plus";
import "./index.scss";

export const Dialog = defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: true,
    },
    getRef: Function,
    rootNode: Object,
  },
  setup(props, context) {
    let dialog;

    function onClosed(...arg) {
      if (props.rootNode) props.rootNode.remove();
      context.emit("closed", ...arg);
    }

    function ref(el) {
      dialog = el;
      dialog.close = close;
      props?.getRef?.(dialog);
    }

    function close() {
      dialog.visible = false;
    }

    context.expose(dialog);

    return () => {
      return (
        <ElDialog {...props} {...context.attrs} ref={ref} onClosed={onClosed}>
          {{
            header: () => renderSlot(context.slots, "header", { dialog }),
            footer: () => renderSlot(context.slots, "footer", { dialog }),
            default: () => renderSlot(context.slots, "default", { dialog }),
          }}
        </ElDialog>
      );
    };
  },
});

export function useDialogCreate() {
  let instance;
  let ref;
  const div = document.createElement("div");

  function create(node) {
    if (instance) {
      ref.visible = true;
      render(node, div);
      return;
    }

    node.props.getRef = (el) => {
      ref = el;
      Object.assign(create, el);
    };
    render(node, div);
    if (!instance) instance = node;
  }
  return create;
}

export function useDialog(node) {
  const div = document.createElement("div");
  node.props.rootNode = div;
  render(node, div);
  document.body.appendChild(div);
}