import { ref, reactive, computed, watch } from "vue";
import { selectConfig } from "../common";
import { usePromise, getPromiseConfig, useInterceptPromiseApply } from "../promise";
import { List } from "@rainbow_ljy/rainbow-js";

const createObserve = (object = {}) => {
  const obj = {};
  for (const key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      const element = object[key];
      obj[key] = {
        set(v) {
          element.value = v;
        },
        get() {
          return element.value;
        },
      };
    }
  }
  return obj;
};

export function useList(options = {}) {
  const LIST = new List({
    ...options,
    init(obs) {
      const select = ref(obs.select);
      const index = ref(obs.index);
      const value = ref(obs.value);
      const label = ref(obs.label);
      const list = ref(obs.list);
      const data = ref(obs.data);
      const observe = createObserve({ select, index, value, label, list, data });

      console.log("observe", observe);

      return observe;
    },
  });

  // LIST.init()

  console.log("LIST", LIST);

  return LIST;
}

export class Radio {
  constructor(p) {
    const list = ref();
    const select = ref();
    const value = ref();
    const label = ref();
    const index = ref();

    console.log(reactive({ select }));

    // this.list = list;

    // Object.assign(this, reactive({ select }));
    const refs = {
      list,
      select,
      value,
      label,
      index,
    };

    const proxy = reactive({ select, list, value, refs });

    this.list = proxy.list;
  }

  onSelect() {
    //
  }
}

export const ListRadio = (options = {}) => {
  const config = selectConfig(options);

  const find = (val) => (el) => config.formatterValue(el) === val;
  let listArray = config.list;

  const item = (() => {
    if (config.activeItem) return config.activeItem;
    const map = {
      indexItem: undefined,
      valueItem: undefined,
      labelItem: undefined,
    };

    if (config.activeLabel) {
      map.labelItem = listArray?.find?.((el) => config.activeLabel === config.formatterLabel(el));
    }

    if (config.activeIndex && config.activeIndex === 0) {
      map.indexItem = listArray[config.activeIndex];
    }

    map.valueItem = listArray?.find?.(find(config.activeValue));

    return map[config.priority] || map.indexItem || map.valueItem || map.labelItem;
  })();
  const value = config.activeValue || config.formatterValue(item);
  const index = config.activeIndex || listArray?.findIndex?.(find(value));
  const label = config.activeLabel || config.formatterLabel(item);
  // console.log('init', item, value, index, label);
  const listData = ref(listArray);
  const activeItem = ref(item);
  const activeValue = ref(value);
  const activeLabel = ref(label);
  const activeIndex = ref(index);

  let store = {
    activeItem: null,
    activeIndex: null,
    activeValue: null,
    activeLabel: null,
  };

  const save = () => {
    store = {
      activeItem: activeItem.value,
      activeValue: activeValue.value,
      activeLabel: activeLabel.value,
      activeIndex: activeIndex.value,
    };
    // console.log('save', store);
  };

  const restore = () => {
    activeItem.value = store.activeItem;
    activeValue.value = store.activeValue;
    activeLabel.value = store.activeLabel;
    activeIndex.value = store.activeIndex;
    // console.log('restore', store);
  };

  save();

  const changeItem = (el, nth) => {
    if (config.cancelSame && activeItem.value === el) {
      activeItem.value = undefined;
      activeIndex.value = undefined;
      activeValue.value = undefined;
      activeLabel.value = undefined;
      return;
    }
    activeItem.value = el;
    activeIndex.value = nth;
    activeValue.value = config.formatterValue(activeItem.value);
    activeLabel.value = config.formatterLabel(activeItem.value);
    // console.log('changeItem -store', store);
  };

  const setValue = (val) => {
    activeValue.value = val;
    activeItem.value = listArray?.find?.(find(activeValue.value));
    activeIndex.value = listArray?.findIndex?.(find(activeValue.value));
    activeLabel.value = config.formatterLabel(activeItem.value);
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
    activeLabel.value = undefined;
    activeIndex.value = undefined;
  };

  return [
    [activeValue, activeItem, activeIndex, activeLabel, listData],
    [changeItem, setValue, same, reset, save, restore, setData],
    reactive({ activeValue, activeItem, activeIndex, activeLabel, listData }),
    { changeItem, setValue, same, reset, save, restore, setData },
  ];
};
