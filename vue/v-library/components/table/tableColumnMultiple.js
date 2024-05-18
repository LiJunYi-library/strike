import { defineComponent, h, ref, watch } from "vue";
import { ElTableColumn, ElCheckbox, ElText, ElLink, ElImage, ElPopover } from "element-plus";
import { objectFilter } from "@rainbow_ljy/rainbow-js";
import { TableColumnHoc } from "./tableColumn";

export const TableColumnMultiple = TableColumnHoc({
  props: {
    width: {
      type: [String, Number],
      default: "60",
    },
  },
  emits: ["select"],
  renderHeader(config, arg) {
    const { context, vm } = config;
    const listHook = vm.$parent.$attrs?.listHook;
    if (!listHook) return;
    function onChange() {
      listHook.triggerSelect();
      context.emit("select");
    }

    const vNode = (
      <ElCheckbox
        model-value={listHook.isSelectAll}
        indeterminate={listHook.indeterminate}
        onChange={onChange}
      ></ElCheckbox>
    );

    return context.slots?.header?.(listHook, config, arg, vNode) ?? vNode;
  },
  renderDefault({ context, vm }, arg) {
    const listHook = vm.$parent.$attrs?.listHook;
    if (!listHook) return;
    const { row, $index } = arg;
    const attrs = objectFilter(context.attrs, /checkbox_/g);
    function onChange() {
      listHook.onSelect(row, $index);
      context.emit("select");
    }
    return (
      <ElCheckbox
        disabled={listHook.formatterDisabled(row, $index)}
        model-value={listHook.same(row, $index)}
        onChange={onChange}
        {...attrs}
      ></ElCheckbox>
    );
  },
});
