// import { useRadio, useAsyncRadio } from "./radio";
// import { useMultiple, useAsyncMultiple } from "./multiple";
export { getTreeSelectProps, useTreeSelect, useAsyncTreeSelect };

function getTreeSelectProps(options = {}) {
  return {
    select: undefined,
    value: undefined,
    label: undefined,
    index: undefined,
    cancelSame: false, // 是否取消相同的
    isMultiple: false,
    onChange: () => undefined,
    layer: [false, false, true], // 树形结构 可以单选第几层的数据
    formatterChildren: (item) => item?.children,
    formatterValue: (item) => item?.value,
    formatterLabel: (item) => item?.label,
    formatterDisabled: (item) => item?.disabled ?? false,
    priority: "valueItem", // 优先使用的 valueItem ||   indexItem || labelItem
    ...options,
    list: options.list || [],
  };
}

function useTreeSelect(props = {}) {
  // if (props.isMultiple) return useMultiple(props);
  // return useRadio(props);
}

function useAsyncTreeSelect(props = {}) {
  //   if (props.isMultiple) return useAsyncMultiple(props);
  //   return useAsyncRadio(props);
}
