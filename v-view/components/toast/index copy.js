import { defineComponent, Teleport, render, reactive, renderSlot, ref } from "vue";
import "./index.scss";
import { useModelWatch } from "@rainbow_ljy/v-hooks";
import { fetchQueue } from "@rainbow_ljy/v-hooks";
import { useQueue, arrayRemove } from "@rainbow_ljy/rainbow-js";
import { RILoading } from "../icon";

export const RToastHoc = (consfig = {}) => {
  const option = {
    renderContent(props, context) {
      return (
        <div class={["r-toast-content"]}>
          {props.iconClass && <i class={[props.iconClass]}></i>}
          {props.loading && renderSlot(context.slots, "icon", {}, () => [<RILoading />])}
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
      loading: { type: Boolean, default: false },
      iconClass: { type: String, default: "" },
      timeOut: { type: Number, default: 3000 },
      ...option.props,
    },
    emits: ["onUpdate:visible"],
    setup(props, context) {
      const visible = ref(false);

      // useModelWatch(props, context, "visible", () => {
      //   //
      // });

      console.log(props.visible, "setup - toast", visible.value);

      function show() {
        visible.value = true;
      }

      function hide() {
        visible.value = false;
      }

      const ctx = reactive({ show, hide, visible });

      context.expose(ctx);
      return () => {
        console.log(props.visible, "render - toast", visible.value);
        if (props.visible === false) return null;
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
    RToastQueue.push(props);
    setTimeout(() => {
      close(props);
    }, props.ms || 1000);
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

/******* */

// export function showToastHoc(node, props) {
//   const div = document.createElement("div");
//   render(node, div);
//   node.component.exposed.show();
// }

// export function showToast(props) {
//   const node = <RToast {...props}></RToast>;
//   return showToastHoc(node, props);
// }

// export function createToastHoc(node, props) {
//   const div = document.createElement("div");
//   render(node, div);

//   function show(props) {
//     const node = <RToast {...props}></RToast>;
//     render(node, div);
//     node.component.exposed.show();
//   }

//   function hide(props) {
//     node.component.exposed.hide();
//   }

//   return { show, hide };
// }

// export function createToast(props) {
//   const node = <RToast {...props}></RToast>;
//   return createToastHoc(node, props);
// }

// export function createToastFetchQueue() {
//   const toast = createToast();
//   const configs = [];
//   return fetchQueue({
//     onRequest(config) {
//       configs.push(config);
//       toast.show({ text: config.toastText, showLoadingIcon: config.toastShowLoadingIcon });
//     },
//     onResponse(config) {
//       arrayRemove(configs, config);
//       const lastConfig = configs.at(-1);
//       if (!lastConfig) return;
//       toast.show({ text: lastConfig.toastText, showLoadingIcon: config.toastShowLoadingIcon });
//     },
//     onFinish() {
//       toast.hide();
//     },
//   });
// }
