import { defineComponent, renderSlot, ref, reactive, watch } from "vue";
import { RPopup } from "../popup";
import "./index.scss";

export const RPulldown = defineComponent({
  props: {
    label: { type: [String, Number], default: "" },
    defaultLabel: [String, Number],
    stopPropagation: { type: Boolean, default: true },
    labelClass: [String, Number],
    popTop: [String, Number, Function],
    popLeft: [String, Number, Function],
    teleport: [String, Number, HTMLElement],
    teleportDisabled: { type: Boolean, default: true },
    visible: Boolean,
  },
  emits: ["labelClick", "update:visible"],
  setup(props, context) {
    let pulldownHtml;
    const visible = ref(false);
    function onUpdateVisible(val) {
      visible.value = val;
      context.emit("update:visible", val);
    }
    watch(
      () => props.visible,
      () => {
        if (visible.value === props.visible) return;
        visible.value = props.visible;
      }
    );

    function setVisible(v) {
      visible.value = v;
      context.emit("update:visible", v);
    }

    const ctx = reactive({ visible, setVisible });

    function onClick(event) {
      visible.value = !visible.value;
      context.emit("update:visible", visible.value);
      context.emit("labelClick");
    }

    function onTouchstart(event) {
      event.stopPropagation();
    }

    function getTop() {
      if (props.popTop) {
        if (props.popTop instanceof Function) return props.popTop(pulldownHtml);
      }
      if (!pulldownHtml) return 0;
      if (props.teleport === "body") {
        const offset = pulldownHtml.getBoundingClientRect();
        return offset.bottom + "px";
      }
      return pulldownHtml.offsetHeight + "px";
    }

    function getLeft() {
      if (props.popLeft) {
        return props.popLeft;
      }
      if (!pulldownHtml) return 0;
      if (props.teleport === "body") return 0;
      const offset = pulldownHtml.getBoundingClientRect();
      return -offset.left + "px";
    }

    return (vm) => {
      return (
        <div
          class="r-pulldown"
          ref={(el) => (pulldownHtml = el)}
          onTouchstart={onTouchstart}
          onClick={onClick}
          style={{ zIndex: visible.value ? 2001 : 2000 }}
        >
          <div class={["r-pulldown-content", props.labelClass]}>
            {renderSlot(context.slots, "content", ctx, () => [
              <div class="r-pulldown-text">
                {renderSlot(context.slots, "label", ctx, () => [
                  <div class="r-pulldown-label"> {props.label} </div>,
                ])}
                <span class={["r-pulldown-icon", !visible.value && "rote"]}>
                  {renderSlot(context.slots, "icon", ctx, () => [
                    <i class={["iconfont"]}>&#xe887;</i>,
                  ])}
                </span>
              </div>,
            ])}
          </div>
          <RPopup
            teleport={props.teleport}
            {...context.attrs}
            left={getLeft()}
            top={getTop()}
            position="top"
            visible={visible.value}
            onUpdate:visible={onUpdateVisible}
          >
            {renderSlot(context.slots, "default", ctx)}
          </RPopup>
        </div>
      );
    };
  },
});

export * from "./select";
