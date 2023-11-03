import { defineComponent, renderSlot, renderList } from "vue";

import { RPulldown } from "./index";

export const RPulldownSelect = defineComponent({
  props: {
    listHook: Object,
    label: { type: [String, Number], default: "" },
  },
  setup(props, context) {
    const listHook = props.listHook;

    function onClick(item, index, popCtx) {
      if (listHook.onSelect(item, index)) return;
      context.emit("change", listHook.value);
      popCtx.setVisible(false);
    }

    return () => {
      return (
        <RPulldown {...context.attrs}>
          {{
            content: (popCtx) => (
              <div class={["r-dropdown-text", listHook.label && "r-dropdown-text-act"]}>
                {renderSlot(context.slots, "label", popCtx, () => [
                  <div class="r-dropdown-label"> {listHook.label || props.label} </div>,
                ])}
                <span class={["r-dropdown-icon", !popCtx.visible && "rote"]}>
                  {renderSlot(context.slots, "icon", popCtx, () => [
                    <i class={["iconfont"]}>&#xe887;</i>,
                  ])}
                </span>
              </div>
            ),
            // ...context.slots,
            default: (popCtx) => (
              <div class="r-dropdown-select">
                <div class="r-dropdown-select-list">
                  {renderList(listHook.list, (item, index) => {
                    return renderSlot(context.slots, "default", { item, index }, () => [
                      <div
                        onClick={() => onClick(item, index, popCtx)}
                        class={[
                          "r-dropdown-select-list-item",
                          listHook.same(item, index) && "r-dropdown-select-list-item-act",
                        ]}
                        key={index}
                      >
                        {renderSlot(context.slots, "item", { item, index }, () => [
                          listHook.formatterLabel(item, index),
                        ])}
                      </div>,
                    ]);
                  })}
                </div>
              </div>
            ),
          }}
        </RPulldown>
      );
    };
  },
});
