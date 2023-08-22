import { ref, reactive, computed, watch } from "vue";
import { useRadio } from "./radio";
import { useMultiple } from "./multiple";
export { getSelectProps, useSelect };

function getSelectProps(options = {}) {
  return {
    select: undefined,
    value: undefined,
    label: undefined,
    index: undefined,
    cancelSame: false, // 是否取消相同的
    onChange: () => undefined,
    formatterValue: (item) => item?.value,
    formatterLabel: (item) => item?.label,
    priority: "valueItem", // 优先使用的 valueItem ||   indexItem || labelItem
    ...options,
    list: options.list || [],
  };
}

function useSelect(props = {}) {
  if (props.isMultiple) return useMultiple(props);
  return useRadio(props);
}
