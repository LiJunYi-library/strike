export const selectConfig = (options = {}) => {
  return {
    activeIndex: undefined,
    activeItem: undefined,
    activeValue: undefined,
    activeLable: undefined,
    modelValue: undefined,
    modelLable: undefined,
    modelItem: undefined,
    modelIndex: undefined,
    cancelSame: false, // 是否取消相同的
    multiple: false,
    layer: [false, false, true], // 树形结构 可以单选第几层的数据
    saveState: false, // 是否自动保存状态
    formatterChildren: (item) => item?.children,
    formatterValue: (item) => item?.value,
    formatterLable: (item) => item?.lable,
    priority: "valueItem", // 优先使用的 activeIndex ||   activeItem ||activeValue
    ...options,
    list: options.list || [],
  };
};
