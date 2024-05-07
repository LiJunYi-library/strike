import { defineComponent, render, renderSlot } from "vue";
import { ElDialog } from "element-plus";
import "./index.scss";

export const Dialog = defineComponent({
  props: {
    top: {
      type: String,
      default: "0px",
    },
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
        <ElDialog {...props} {...context.attrs} class="lib-dialog" ref={ref} onClosed={onClosed}>
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

export function useDialogCreate(config = {}) {
  let instance;
  let ref;
  const appContext = config.appContext;
  const div = document.createElement("div");

  function create(node) {
    if (!node.appContext) node.appContext = appContext;
    if (instance) {
      ref.visible = true;
      render(node, div);
      return;
    }
    if (!node.props) node.props = {};
    node.props.getRef = (el) => {
      ref = el;
      Object.assign(create, el);
    };
    render(node, div);
    if (!instance) instance = node;
  }
  return create;
}

export function useDialog(node, appContext) {
  const div = document.createElement("div");
  node.appContext = appContext;
  if (node.props) node.props.rootNode = div;
  else node.props = { rootNode: div };
  render(node, div);
  document.body.appendChild(div);
}
