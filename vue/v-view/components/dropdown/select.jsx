import {
  defineComponent,
  renderSlot,
  renderList,
  computed,
  onMounted,
  onBeforeUnmount,
  ref,
  reactive,
  provide,
} from "vue";
import "./index.scss";
import { RDropdown } from "./index";

export const RDropdownSelect = defineComponent({
  props: {
    listHook: Object,
    label: { type: [String, Number], default: "" },
  },
  setup(props, context) {

    function onClick(item, index, closed) {
      if (props.listHook.same(item, index)) return;
      props.listHook.onSelect(item, index);
      context.emit("change", props.listHook.value);
      closed();
    }
    return () => {
      return (
        <RDropdown {...context.attrs}>
          {{
            content: (ctx) => (
              <div class={["r-dropdown-text", props.listHook.label && "r-dropdown-text-act"]}>
                {renderSlot(context.slots, "label", ctx, () => [
                  <div class="r-dropdown-label"> {props.listHook.label || props.label} </div>,
                ])}
                <span class={["r-dropdown-icon", !ctx.look && "rote"]}>
                  {renderSlot(context.slots, "icon", ctx, () => [
                    <i class={["iconfont"]}>&#xe887;</i>,
                  ])}
                </span>
              </div>
            ),
            // ...context.slots,
            default: ({ closed }) => (
              <div class="r-dropdown-select">
                <div class="r-dropdown-select-list">
                  {renderList(props.listHook.list, (item, index) => {
                    return renderSlot(context.slots, "default", { item, index }, () => [
                      <div
                        onClick={() => onClick(item, index, closed)}
                        class={[
                          "r-dropdown-select-list-item",
                          props.listHook.same(item, index) && "r-dropdown-select-list-item-act",
                        ]}
                        key={index}
                      >
                        {renderSlot(context.slots, "item", { item, index }, () => [
                          props.listHook.formatterLabel(item, index),
                        ])}
                      </div>,
                    ]);
                  })}
                </div>
              </div>
            ),
          }}
        </RDropdown>
      );
    };
  },
});
