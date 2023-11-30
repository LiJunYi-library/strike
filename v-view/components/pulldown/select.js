import { defineComponent, renderSlot, renderList } from "vue";

import { RPulldown } from "./index";
import { RListSelect, RListSelectProps } from "../list";

export const RPulldownSelect = defineComponent({
  props: {
    label: { type: [String, Number], default: "" },
    ...RListSelectProps,
  },
  emits:['change'],
  setup(props, context) {
    // eslint-disable-next-line
    const listHook = props.listHook;

    function onChange(item, index, popCtx) {
      context.emit("change", listHook.value);
      popCtx.setVisible(false);
    }

    return () => {
      return (
        <RPulldown {...context.attrs}>
          {{
            content: (popCtx) => (
              <div class={["r-pulldown-text", listHook.label && "r-pulldown-text-act"]}>
                {renderSlot(context.slots, "label", popCtx, () => [
                  <div class="r-pulldown-label"> {listHook.label || props.label} </div>,
                ])}
                <span class={["r-pulldown-icon", !popCtx.visible && "rote"]}>
                  {renderSlot(context.slots, "icon", popCtx, () => [
                    <i class={["iconfont"]}>&#xe887;</i>,
                  ])}
                </span>
              </div>
            ),
            default: (popCtx) => (
              <div class={"r-pulldown-list-select"}>
                <RListSelect {...props} onChange={(item, index) => onChange(item, index, popCtx)}>
                  {{default: context.slots.default,item: context.slots.item }}
                </RListSelect>
              </div>
            ),
          }}
        </RPulldown>
      );
    };
  },
});

// <div class="r-pulldown-select" v-loadings={props.v_loadings}>
// <div class="r-pulldown-select-list">
//   {renderList(listHook.list, (item, index) => {
//     return renderSlot(context.slots, "default", { item, index }, () => [
//       <div
//         onClick={() => onClick(item, index, popCtx)}
//         class={[
//           "r-pulldown-select-list-item",
//           listHook.same(item, index) && "r-pulldown-select-list-item-act",
//         ]}
//         key={index}
//       >
//         {renderSlot(context.slots, "item", { item, index }, () => [
//           listHook.formatterLabel(item, index),
//         ])}
//       </div>,
//     ]);
//   })}
// </div>
// </div>
