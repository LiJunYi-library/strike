import { useRadio2, useAsyncRadio2 } from "./radio2";
import { useMultiple2, useAsyncMultiple2 } from "./multiple2";

export { getSelectProps, useSelect, useAsyncSelect };

function getSelectProps(options = {}) {
  return {
    select: undefined,
    value: undefined,
    label: undefined,
    index: undefined,
    cancelSame: false, // 是否取消相同的
    isMultiple: false,
    onChange: () => undefined,
    Validator: () => true,
    formatterValue: (item) => item?.value,
    formatterLabel: (item) => item?.label,
    formatterDisabled: (item) => item?.disabled ?? false,
    formatterList: (list) => list,
    priority: "valueItem", // 优先使用的 valueItem ||   indexItem || labelItem
    ...options,
    list: options.list || [],
  };
}

function useSelect(props = {}) {
  if (props.isMultiple) return useMultiple2(props);
  return useRadio2(props);
}

function useAsyncSelect(props = {}) {
  if (props.isMultiple) return useAsyncMultiple2(props);
  return useAsyncRadio2(props);
}
