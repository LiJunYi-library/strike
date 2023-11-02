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
  },
  setup(props, context) {
    let dropdownHtml;
    const look = ref(false);
    let popup;

    const ctx = reactive({ look });

    // ref={(el) => {
    //   console.log(">>>>>>>>>", el);
    // }}

    function onClick(event) {
      if (!popup) {
        popup = <RPopup visible={true}>123</RPopup>;
        render(popup, dropdownHtml);
      }

      console.log("onClick", popup);
      // const node = <RPopup visible={true}>123</RPopup>;
      // const div = document.createElement("div");
      // console.log("onClick", popup);
      // const tem = render(popup, dropdownHtml);
      // console.log("onClick", dropdownHtml);
    }

    function onTouchstart(event) {
      event.stopPropagation();
    }

    // onClick();

    return (vm) => {
      return (
        <div
          class="r-dropdown"
          ref={(el) => (dropdownHtml = el)}
          onTouchstart={onTouchstart}
          onClick={onClick}
        >
          <div class={["r-dropdown-content", props.labelClass]}>
            {renderSlot(context.slots, "content", ctx, () => [
              <div class="r-dropdown-text">
                {renderSlot(context.slots, "label", ctx, () => [
                  <div class="r-dropdown-label"> {props.label} </div>,
                ])}
                <span class={["r-dropdown-icon", !look.value && "rote"]}>
                  {renderSlot(context.slots, "icon", ctx, () => [
                    <i class={["iconfont"]}>&#xe887;</i>,
                  ])}
                </span>
              </div>,
            ])}
          </div>
          {/* <RPopup ref={(el) => (popup.value = el)}></RPopup> */}
        </div>
      );
    };
  },
});

export * from "./select";
