import { ref, reactive } from "vue";
export const selectConfig = (options = { list: [] }) => {
  return {
    activeItem: undefined,
    activeIndex: undefined,
    activeValue: undefined,
    activeLable: undefined,

    modelItem: undefined,
    modelValue: undefined,
    modelLable: undefined,

    modelIndex: undefined,
    cancelSame: false, // 是否取消相同的
    multiple: false,
    layer: [false, false, true], // 树形结构 可以单选第几层的数据
    saveState: false, // 是否自动保存状态
    formatterChildren: (item) => item?.children,
    formatterValue: (item) => item?.value,
    formatterLable: (item) => item?.lable,
    priority: "valueItem", // 优先使用的 activeIndex || activeItem ||activeValue
    ...options,
    list: options.list || [],
  };
};

// export function useListRadio(options = {}) {
//   const config = selectConfig(options);
//   const list = ref(config.list);

//   const activeItem = ref();
//   const activeIndex = ref();
//   const activeValue = ref();
//   const activeLable = ref();
//   const parms = reactive({ activeItem, activeIndex, activeValue, activeLable, list });

//   const vFindIt = (val, item) => config.formatterValue(item) === val;
//   const LFindIt = (val, item) => config.formatterLable(item) === val;

//   const same = (val) => activeItem.value === val;
//   const vFindItem = (val) => list.value.find(vFindIt.bind(undefined, val));
//   const lFindItem = (val) => list.value.find(LFindIt.bind(undefined, val));

//   const setValue = (val) => {
//     activeValue.value = val;
//     activeItem.value = vFindItem(val);
//     activeLable.value = config.formatterLable(activeItem.value);
//     activeIndex.value = list.value.findIndex((el) => el === activeItem.value);
//   };

//   const setItem = (val, index) => {
//     activeItem.value = val;
//     activeValue.value = config.formatterValue(activeItem.value);
//     activeLable.value = config.formatterLable(activeItem.value);
//     if (index === 0 || index) activeLable.value = index;
//     else activeIndex.value = list.value.findIndex((el) => el === activeItem.value);
//   };

//   let store = {
//     activeItem: null,
//     activeIndex: null,
//     activeValue: null,
//     activeLable: null,
//   };

//   const save = () => {
//     store = {
//       activeItem: activeItem.value,
//       activeValue: activeValue.value,
//       activeLable: activeLable.value,
//       activeIndex: activeIndex.value,
//     };
//     // console.log('save', store);
//   };

//   const restore = () => {
//     activeItem.value = store.activeItem;
//     activeValue.value = store.activeValue;
//     activeLable.value = store.activeLable;
//     activeIndex.value = store.activeIndex;
//     // console.log('restore', store);
//   };

//   setValue(config.activeValue);
//   save();
// }

export const useListRadio = (options = {}) => {
  const config = selectConfig(options);
  const find = (val) => (el) => config.formatterValue(el) === val;
  let listArray = config.list;

  const item = (() => {
    if (config.activeItem) return config.activeItem;
    const map = {
      indexItem: undefined,
      valueItem: undefined,
      lableItem: undefined,
    };

    if (config.activeLable) {
      map.lableItem = listArray?.find?.((el) => config.activeLable === config.formatterLable(el));
    }

    if (config.activeIndex && config.activeIndex === 0) {
      map.indexItem = listArray[config.activeIndex];
    }

    map.valueItem = listArray?.find?.(find(config.activeValue));

    return map[config.priority] || map.indexItem || map.valueItem || map.lableItem;
  })();
  const value = config.activeValue || config.formatterValue(item);
  const index = config.activeIndex || listArray?.findIndex?.(find(value));
  const lable = config.activeLable || config.formatterLable(item);
  // console.log('init', item, value, index, lable);
  const listData = ref(listArray);
  const activeItem = ref(item);
  const activeValue = ref(value);
  const activeLable = ref(lable);
  const activeIndex = ref(index);

  let store = {
    activeItem: null,
    activeIndex: null,
    activeValue: null,
    activeLable: null,
  };

  const save = () => {
    store = {
      activeItem: activeItem.value,
      activeValue: activeValue.value,
      activeLable: activeLable.value,
      activeIndex: activeIndex.value,
    };
  };

  const restore = () => {
    activeItem.value = store.activeItem;
    activeValue.value = store.activeValue;
    activeLable.value = store.activeLable;
    activeIndex.value = store.activeIndex;
  };

  save();

  const changeItem = (el, nth) => {
    if (config.cancelSame && activeItem.value === el) {
      activeItem.value = undefined;
      activeIndex.value = undefined;
      activeValue.value = undefined;
      activeLable.value = undefined;
      return;
    }
    activeItem.value = el;
    activeIndex.value = nth;
    activeValue.value = config.formatterValue(activeItem.value);
    activeLable.value = config.formatterLable(activeItem.value);
  };

  const setValue = (val) => {
    activeValue.value = val;
    activeItem.value = listArray?.find?.(find(activeValue.value));
    activeIndex.value = listArray?.findIndex?.(find(activeValue.value));
    activeLable.value = config.formatterLable(activeItem.value);
  };

  const same = (val) => activeItem.value === val;

  const setData = (data) => {
    listArray = data;
    listData.value = data;
    setValue(activeValue.value);
  };

  const reset = () => {
    activeItem.value = undefined;
    activeValue.value = undefined;
    activeLable.value = undefined;
    activeIndex.value = undefined;
  };

  return [
    [activeValue, activeItem, activeIndex, activeLable, listData],
    [changeItem, setValue, same, reset, save, restore, setData],
    reactive({ activeValue, activeItem, activeIndex, activeLable, listData }),
    { changeItem, setValue, same, reset, save, restore, setData },
  ];
};
