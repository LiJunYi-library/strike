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
    const listHook = props.listHook;

    function onClick(item, index, closed) {
      if (listHook.same(item, index)) return;
      listHook.onSelect(item, index);
      context.emit("change", listHook.value);
      closed();
    }
    return () => {
      return (
        <RDropdown {...context.attrs}>
          {{
            content: (ctx) => (
              <div class={["r-dropdown-text", listHook.label && "r-dropdown-text-act"]}>
                {renderSlot(context.slots, "label", ctx, () => [
                  <div class="r-dropdown-label"> {listHook.label || props.label} </div>,
                ])}
                <span class={["r-dropdown-icon", !ctx.look && "rote"]}>
                  {renderSlot(context.slots, "icon", ctx, () => [
                    <i class={["iconfont"]}>&#xe887;</i>,
                  ])}
                </span>
              </div>
            ),
            ...context.slots,
            default: ({ closed }) => (
              <div class="r-dropdown-select-list">
                {renderList(listHook.list, (item, index) => {
                  return renderSlot(context.slots, "item", { item, index }, () => [
                    <div
                      onClick={() => onClick(item, index, closed)}
                      class={[
                        "r-dropdown-select-list-item",
                        listHook.same(item, index) && "r-dropdown-select-list-item-act",
                      ]}
                      key={index}
                    >
                      {listHook.formatterLabel(item, index)}
                    </div>,
                  ]);
                })}
              </div>
            ),
          }}
        </RDropdown>
      );
    };
  },
});
