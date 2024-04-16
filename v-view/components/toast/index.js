import { defineComponent, Teleport, render, reactive, renderSlot } from "vue";
import "./index.scss";
import { useModelWatch } from "@rainbow_ljy/v-hooks";
import { useQueue } from "@rainbow_ljy/rainbow-js";
import { RILoading } from "../icon";

export const RToastHoc = (consfig = {}) => {
  const option = {
    renderContent(props, context) {
      return (
        <div class={["r-toast-content"]}>
          {props.iconClass && <i class={[props.iconClass]}></i>}
          {props.loading && renderSlot(context.slots, "icon", {}, () => [<RILoading class="r-toast-loading" />])}
          {props.loadingText && <div class="r-toast-loadingText">{props.loadingText} </div>}
          {props.text && <div class="r-toast-text">{props.text} </div>}
          {renderSlot(context.slots, "default")}
        </div>
      );
    },
    ...consfig,
  };
  return defineComponent({
    props: {
      text: { type: String, default: "" },
      loadingText: { type: String, default: "" },
      visible: { type: Boolean, default: false },
      loading: { type: Boolean, default: false },
      iconClass: { type: String, default: "" },
      timeOut: { type: Number, default: 3000 },
      ms: { type: Number, default: 3000 },
      ...option.props,
    },
    emits: ["onUpdate:visible"],
    setup(props, context) {
      const visible = useModelWatch(props, context, "visible", () => {
        //
      });

      function show() {
        visible.value = true;
      }

      function hide() {
        visible.value = false;
      }

      const ctx = reactive({ show, hide, visible });

      context.expose(ctx);
      return () => {
        if (visible.value === false) return null;
        return (
          <Teleport to={document.body}>
            <div class={["r-toast", context.attrs.class]}>
              {option.renderContent(props, context)}
            </div>
          </Teleport>
        );
      };
    },
  });
};

export const RToast = RToastHoc();

export function createRToast() {
  const div = document.createElement("div");
  let node = <RToast></RToast>;
  render(node, div);

  const RToastQueue = useQueue({
    onPushed(queue, current) {
      update({ ...current, visible: true });
    },
    onRemoved(queue, current) {
      const last = queue.at(-1);
      if (last) {
        update({ ...last, visible: true });
      } else {
        update({ ...current, visible: false });
      }
    },
  });

  function update(props = {}) {
    node = <RToast {...props}></RToast>;
    render(node, div);
  }

  function show(props = {}) {
    const config = { ...props };
    RToastQueue.push(config);
    setTimeout(() => {
      close(config);
    }, config.ms || 3000);
  }

  function open(props = {}) {
    RToastQueue.push(props);
  }

  function close(props = {}) {
    RToastQueue.remove(props);
  }

  function look() {
    console.log(RToastQueue);
  }

  return { show, open, close, update, look };
}

export const RGlobalToast = createRToast();
