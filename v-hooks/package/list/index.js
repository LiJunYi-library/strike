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

import { ref, reactive, computed, watch } from "vue";
import { selectConfig } from "../common";
import { usePromise, getPromiseConfig } from "../promise";

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
    // console.log('save', store);
  };

  const restore = () => {
    // console.log('restore', store);
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
    // console.log('changeItem -store', store);
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

export const useListMultiple = (options = {}) => {
  const config = selectConfig(options);
  let listArray = config.list;
  const revArray = (source) => {
    if (source instanceof Array) return source;
    if (source === 0 || source === "") return [source];
    if (source) return [source];
    return [];
  };
  const isHave = (source) => source && source.length;
  const isLen = (source) => (isHave(source) ? source : undefined);
  const filter = (target, source, fun = config.formatterValue) => {
    return target.filter((el) => source.some((val) => val === fun(el)));
  };
  const finIndexs = (target, source) => {
    const arr = [];
    target.forEach((el, index) => {
      if (source.some((val) => config.formatterValue(val) === config.formatterValue(el))) {
        arr.push(index);
      }
    });
    return arr;
  };

  config.activeItem = revArray(config.activeItem);
  config.activeIndex = revArray(config.activeIndex);
  config.activeValue = revArray(config.activeValue);
  config.activeLable = revArray(config.activeLable);

  const item = (() => {
    if (isHave(config.activeItem)) return config.activeItem;
    const map = {
      indexItem: [],
      valueItem: [],
      lableItem: [],
    };
    if (isHave(config.activeLable)) {
      map.lableItem = filter(listArray, config.activeLable, config.formatterLable);
    }
    if (isHave(config.activeIndex)) {
      map.indexItem = config.activeIndex.map((num) => listArray[num]);
    }
    if (isHave(config.activeValue)) {
      map.valueItem = filter(listArray, config.activeValue);
    }
    const v =
      isLen(map[config.priority]) ||
      isLen(map.indexItem) ||
      isLen(map.valueItem) ||
      isLen(map.lableItem) ||
      [];
    return v.filter(Boolean);
  })();
  const value = isLen(config.activeValue) || item.map((el) => config.formatterValue(el));
  const index = isLen(config.activeIndex) || finIndexs(listArray, item);
  const lable = isLen(config.activeLable) || item.map((el) => config.formatterLable(el));
  // console.log('init', item, value, index, lable);
  const listData = ref(listArray);
  const activeItem = ref(item);
  const activeValue = ref(value);
  const activeIndex = ref(index);
  const activeLable = ref(lable);

  const store = {
    activeItem: null,
    activeIndex: null,
    activeValue: null,
    activeLable: null,
  };

  const save = () => {
    store.activeItem = [...activeItem.value];
    store.activeIndex = [...activeIndex.value];
    store.activeValue = [...activeValue.value];
    store.activeLable = [...activeLable.value];
  };

  const restore = () => {
    if (!store.activeItem) return;
    activeItem.value = [...store.activeItem];
    activeIndex.value = [...store.activeIndex];
    activeValue.value = [...store.activeValue];
    activeLable.value = [...store.activeLable];
  };

  save();

  const same = (el) => activeItem.value.some((val) => val === el);

  const changeItem = (el, nth) => {
    const val = config.formatterValue(el);
    const lab = config.formatterLable(el);
    if (same(el)) {
      activeItem.value = activeItem.value.filter((v) => v !== el);
      activeIndex.value = activeIndex.value.filter((v) => v !== nth);
      activeValue.value = activeItem.value.map((v) => config.formatterValue(v));
      activeLable.value = activeItem.value.map((v) => config.formatterLable(v));
    } else {
      activeItem.value.push(el);
      activeIndex.value.push(nth);
      activeValue.value.push(val);
      activeLable.value.push(lab);
    }
  };

  const setValue = (v) => {
    // console.log('setValue ----', v);
    activeValue.value = revArray(v);
    activeItem.value = filter(listArray, activeValue.value);
    activeIndex.value = finIndexs(listArray, activeItem.value);
    activeLable.value = activeItem.value.map((el) => config.formatterLable(el));
  };

  const setData = (data) => {
    listArray = data;
    listData.value = data;
    setValue(activeValue.value);
  };

  const reset = () => {
    activeValue.value = [];
    activeItem.value = [];
    activeIndex.value = [];
    activeLable.value = [];
  };

  return [
    [activeValue, activeItem, activeIndex, activeLable],
    [changeItem, setValue, same, reset, save, restore, setData],
    reactive({ activeValue, activeItem, activeIndex, activeLable }),
    { changeItem, setValue, same, reset, save, restore, setData },
  ];
};

export const useListSelect = (options = {}) => {
  const config = selectConfig(options);
  if (config.multiple) return useListMultiple(options);
  return useListRadio(options);
};

/*
 *
 *
 */
export const getFetchListConfig = (options = {}) => ({
  ...getPromiseConfig(options),
  fetchCB: undefined,
  formatterList({ data }) {
    if (!data) return [];
    if (data instanceof Array) return data;
    return data.list || [];
  },
  ...options,
});
export const useFetchList = (options = {}) => {
  const config = getFetchListConfig(options);
  const hooks = usePromise(config.fetchCB);
  hooks.begin = ref(false);
  hooks.list = ref([]);
  hooks.fetch = async (...arg) => {
    await hooks.run(...arg);
    hooks.list = config.formatterList(hooks);
  };
  
  return hooks;
};

/*
 * 适用只有一个列表时 多个建议用其他的
 *  currentPage 支持双向数据绑定
 *  pageSize 支持双向数据绑定
 */
export const getPaginationConfig = (options = {}) => {
  const _super = getFetchListConfig(options);
  // 方法不要用this 用 config
  const config = {
    _super: _super,
    ..._super,
    formatterTotal: ({ data }) => {
      if (!data) return 0;
      if (data instanceof Array) return data.length;
      return data.total;
    },
    formatterFinished: ({ total, currentSize }) => {
      return currentSize >= total;
    },
    formatterCurrentPage: ({ currentPage }) => {
      return currentPage + 1;
    },
    serverPaging: false,
    currentPage: 1,
    pageSize: 10,
    total: 0,
    formatterList(hooks) {
      const { currentPage, pageSize, data } = hooks;
      if (!data) return [];
      const isArr = data instanceof Array;
      if (!config.serverPaging) {
        if (!isArr) return [];
        const b = (currentPage - 1) * pageSize;
        const e = currentPage * pageSize;
        return data.slice(b, e);
      }
      return _super.formatterList(hooks);
    },
    ...options,
  };
  return config;
};
export const usePaginationList = (options = {}) => {
  const config = getPaginationConfig(options);

  const hooks = useFetchList(config);
  hooks.list = ref([]);
  hooks.currentPage = ref(config.currentPage);
  hooks.pageSize = ref(config.pageSize);
  hooks.total = ref(config.total);
  hooks.finished = ref(false);
  hooks._currentPage = ref(config.currentPage);

  watch(
    () => hooks.currentPage,
    (val) => {
      hooks._currentPage = val;
      console.log("watch", hooks._currentPage);
    }
  );

  hooks.currentSize = computed(() => hooks.currentPage * hooks.pageSize);

  const resolve = (accumulation = true) => {
    let list = config.formatterList(hooks);
    if (accumulation) list = hooks.list.concat(list);
    hooks.list = list;
    hooks.total = config.formatterTotal(hooks);
    hooks.finished = config.formatterFinished(hooks);
    hooks.begin = false;

    if (!hooks.finished) {
      hooks._currentPage = config.formatterCurrentPage(hooks);
    }
  };

  const fetch = async (accumulation = true, ...arg) => {
    const res = await hooks.run(...arg);
    resolve(accumulation);
    return res;
  };

  const serverConcat = async (...arg) => {
    hooks.currentPage = hooks._currentPage;
    return fetch(true, ...arg);
  };

  const concat = async (...arg) => {
    if (hooks.finished) return console.error("没有更多的了");
    if (config.serverPaging) return serverConcat(...arg);
    hooks.currentPage = hooks.currentPage + 1;
    resolve(true);
  };

  const replace = async (...arg) => {
    if (config.serverPaging) return fetch(false, ...arg);
    resolve(false);
  };

  const reset = async (...arg) => {
    hooks.currentPage = config.currentPage;
    hooks.finished = false;
    hooks.total = config.total;
    return fetch(false, ...arg);
  };

  const beginning = async (...arg) => {
    hooks.begin = true;
    hooks.list = [];
    await reset(...arg);
  };

  hooks["onUpdate:current-page"] = (v) => (hooks.currentPage = v);
  hooks["onUpdate:page-size"] = (v) => (hooks.pageSize = v);
  hooks.resolve = resolve;
  hooks.beginning = beginning;
  hooks.concat = concat;
  hooks.replace = replace;
  hooks.reset = reset;
  hooks.fetch = fetch;

  return hooks;
};

export const useTablePagination = (options = {}) => {
  const hooks = usePaginationList(options);
  hooks.onPageChange = (currentPage, pageSize) => {
    hooks.currentPage = currentPage;
    hooks.pageSize = pageSize;
    hooks.replace();
  };
  return hooks;
};

export const useFetchApplyList = (options = {}) => {
  //
};
