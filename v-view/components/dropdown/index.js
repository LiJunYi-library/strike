import {
  defineComponent,
  renderSlot,
  computed,
  onMounted,
  onBeforeUnmount,
  ref,
  reactive,
  provide,
  render,
  h,
  watch,
  nextTick,
  Teleport,
} from "vue";
import "./index.scss";

import { RPopup } from "../popup";

let prveDropdownPopup;

export const RDropdown = defineComponent({
  props: {
    label: { type: [String, Number], default: "" },
    defaultLabel: [String, Number],
    scrollController: Object,
    stopPropagation: { type: Boolean, default: true },
    labelClass: [String, Number],
    popTop: [String, Number, Function],
    popLeft: [String, Number, Function],
    teleport: [String, Number, HTMLElement],
    teleportDisabled: { type: Boolean, default: true },
    visible: Object,
  },
  setup(props, context) {
    let dropdownHtml;

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
      console.log("dropdown onClick");
    }

    function onTouchstart(event) {
      event.stopPropagation();
    }

    function getTop() {
      if (props.popTop) {
        if (props.popTop instanceof Function) return props.popTop(dropdownHtml);
      }
      if (!dropdownHtml) return 0;
      if (props.teleport === "body") {
        const offset = dropdownHtml.getBoundingClientRect();
        return offset.bottom + "px";
      }
      return dropdownHtml.offsetHeight + "px";
    }

    function getLeft() {
      if (props.popLeft) {
        return props.popLeft;
      }
      if (!dropdownHtml) return 0;
      const offset = dropdownHtml.getBoundingClientRect();
      return -offset.left + "px";
    }

    return (vm) => {
      return (
        <div
          class="r-dropdown"
          ref={(el) => (dropdownHtml = el)}
          onTouchstart={onTouchstart}
          onClick={onClick}
          style={{ zIndex: visible.value ? 2001 : 2000 }}
        >
          <div class={["r-dropdown-content", props.labelClass]}>
            {renderSlot(context.slots, "content", ctx, () => [
              <div class="r-dropdown-text">
                {renderSlot(context.slots, "label", ctx, () => [
                  <div class="r-dropdown-label"> {props.label} </div>,
                ])}
                <span class={["r-dropdown-icon", !visible.value && "rote"]}>
                  {renderSlot(context.slots, "icon", ctx, () => [
                    <i class={["iconfont"]}>&#xe887;</i>,
                  ])}
                </span>
              </div>,
            ])}
          </div>
          <RPopup
            {...context.attrs}
            left={getLeft()}
            top={getTop()}
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
