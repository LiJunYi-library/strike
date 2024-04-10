import { defineComponent, Teleport, render, reactive, renderSlot } from "vue";
import "./index.scss";
import { useModelWatch } from "@rainbow_ljy/v-hooks";
import { fetchQueue } from "@rainbow_ljy/v-hooks";
import { arrayRemove } from "@rainbow_ljy/rainbow-js";
import { RILoading } from "../icon";

export const RToastHoc = (consfig = {}) => {
  const option = {
    renderContent(props, context) {
      return (
        <div class={["r-toast-content"]}>
          {props.iconClass && <i class={[props.iconClass]}></i>}
          {props.showLoadingIcon && renderSlot(context.slots, "icon", {}, () => [<RILoading />])}
          {props.text && <span>{props.text} </span>}
          {renderSlot(context.slots, "default")}
        </div>
      );
    },
    ...consfig,
  };
  return defineComponent({
    props: {
      text: { type: String, default: "" },
      visible: { type: Boolean, default: false },
      showLoadingIcon: { type: Boolean, default: true },
      iconClass: { type: String, default: "" },
      timeOut: { type: Number, default: 3000 },
      ...option.props,
    },
    emits: ["onUpdate:visible"],
    setup(props, context) {
      const visible = useModelWatch(props, context, "visible");
      function show() {
        visible.value = true;
      }
      function hide() {
        visible.value = false;
      }
      const ctx = reactive({ show, hide, visible });
      context.expose(ctx);
      return () => {
        if (!visible.value) return null;
        return (
          <Teleport to={"body"}>
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

export function showToastHoc(node, props) {
  const div = document.createElement("div");
  render(node, div);
  node.component.exposed.show();
}

export function showToast(props) {
  const node = <RToast {...props}></RToast>;
  return showToastHoc(node, props);
}

export function createToastHoc(node, props) {
  const div = document.createElement("div");
  render(node, div);

  function show(props) {
    const node = <RToast {...props}></RToast>;
    render(node, div);
    node.component.exposed.show();
  }

  function hide(props) {
    node.component.exposed.hide();
  }

  return { show, hide };
}

export function createToast(props) {
  const node = <RToast {...props}></RToast>;
  return createToastHoc(node, props);
}

export function createToastFetchQueue() {
  const toast = createToast();
  const configs = [];
  return fetchQueue({
    onRequest(config) {
      configs.push(config);
      toast.show({ text: config.toastText, showLoadingIcon: config.toastShowLoadingIcon });
    },
    onResponse(config) {
      arrayRemove(configs, config);
      const lastConfig = configs.at(-1);
      if (!lastConfig) return;
      toast.show({ text: lastConfig.toastText, showLoadingIcon: config.toastShowLoadingIcon });
    },
    onFinish() {
      toast.hide();
    },
  });
}
