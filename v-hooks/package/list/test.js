
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
      const lable = ref();
      const index = ref();
  
      console.log(reactive({ select }));
  
      // this.list = list;
  
      // Object.assign(this, reactive({ select }));
      const refs = {
        list,
        select,
        value,
        lable,
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
      activeItem.value = store.activeItem;
      activeValue.value = store.activeValue;
      activeLable.value = store.activeLable;
      activeIndex.value = store.activeIndex;
      // console.log('restore', store);
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
  