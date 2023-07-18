import { ref, reactive, computed } from "vue";
import { usePromise, getPromiseConfig, useInterceptPromiseApply } from "../promise";
import { getSelectProps } from "./";

export { useMultiple };

function useMultiple(params) {
    //
}

// export const useListMultiple = (options = {}) => {
//     const config = selectConfig(options);
//     let listArray = config.list;
//     const revArray = (source) => {
//       if (source instanceof Array) return source;
//       if (source === 0 || source === "") return [source];
//       if (source) return [source];
//       return [];
//     };
//     const isHave = (source) => source && source.length;
//     const isLen = (source) => (isHave(source) ? source : undefined);
//     const filter = (target, source, fun = config.formatterValue) => {
//       return target.filter((el) => source.some((val) => val === fun(el)));
//     };
//     const finIndexs = (target, source) => {
//       const arr = [];
//       target.forEach((el, index) => {
//         if (source.some((val) => config.formatterValue(val) === config.formatterValue(el))) {
//           arr.push(index);
//         }
//       });
//       return arr;
//     };
  
//     config.activeItem = revArray(config.activeItem);
//     config.activeIndex = revArray(config.activeIndex);
//     config.activeValue = revArray(config.activeValue);
//     config.activelabel = revArray(config.activelabel);
  
//     const item = (() => {
//       if (isHave(config.activeItem)) return config.activeItem;
//       const map = {
//         indexItem: [],
//         valueItem: [],
//         labelItem: [],
//       };
//       if (isHave(config.activelabel)) {
//         map.labelItem = filter(listArray, config.activelabel, config.formatterlabel);
//       }
//       if (isHave(config.activeIndex)) {
//         map.indexItem = config.activeIndex.map((num) => listArray[num]);
//       }
//       if (isHave(config.activeValue)) {
//         map.valueItem = filter(listArray, config.activeValue);
//       }
//       const v =
//         isLen(map[config.priority]) ||
//         isLen(map.indexItem) ||
//         isLen(map.valueItem) ||
//         isLen(map.labelItem) ||
//         [];
//       return v.filter(Boolean);
//     })();
//     const value = isLen(config.activeValue) || item.map((el) => config.formatterValue(el));
//     const index = isLen(config.activeIndex) || finIndexs(listArray, item);
//     const label = isLen(config.activelabel) || item.map((el) => config.formatterlabel(el));
//     // console.log('init', item, value, index, label);
//     const listData = ref(listArray);
//     const activeItem = ref(item);
//     const activeValue = ref(value);
//     const activeIndex = ref(index);
//     const activelabel = ref(label);
  
//     const store = {
//       activeItem: null,
//       activeIndex: null,
//       activeValue: null,
//       activelabel: null,
//     };
  
//     const save = () => {
//       store.activeItem = [...activeItem.value];
//       store.activeIndex = [...activeIndex.value];
//       store.activeValue = [...activeValue.value];
//       store.activelabel = [...activelabel.value];
//     };
  
//     const restore = () => {
//       if (!store.activeItem) return;
//       activeItem.value = [...store.activeItem];
//       activeIndex.value = [...store.activeIndex];
//       activeValue.value = [...store.activeValue];
//       activelabel.value = [...store.activelabel];
//     };
  
//     save();
  
//     const same = (el) => activeItem.value.some((val) => val === el);
  
//     const changeItem = (el, nth) => {
//       const val = config.formatterValue(el);
//       const lab = config.formatterlabel(el);
//       if (same(el)) {
//         activeItem.value = activeItem.value.filter((v) => v !== el);
//         activeIndex.value = activeIndex.value.filter((v) => v !== nth);
//         activeValue.value = activeItem.value.map((v) => config.formatterValue(v));
//         activelabel.value = activeItem.value.map((v) => config.formatterlabel(v));
//       } else {
//         activeItem.value.push(el);
//         activeIndex.value.push(nth);
//         activeValue.value.push(val);
//         activelabel.value.push(lab);
//       }
//     };
  
//     const setValue = (v) => {
//       // console.log('setValue ----', v);
//       activeValue.value = revArray(v);
//       activeItem.value = filter(listArray, activeValue.value);
//       activeIndex.value = finIndexs(listArray, activeItem.value);
//       activelabel.value = activeItem.value.map((el) => config.formatterlabel(el));
//     };
  
//     const setData = (data) => {
//       listArray = data;
//       listData.value = data;
//       setValue(activeValue.value);
//     };
  
//     const reset = () => {
//       activeValue.value = [];
//       activeItem.value = [];
//       activeIndex.value = [];
//       activelabel.value = [];
//     };
  
//     return [
//       [activeValue, activeItem, activeIndex, activelabel],
//       [changeItem, setValue, same, reset, save, restore, setData],
//       reactive({ activeValue, activeItem, activeIndex, activelabel }),
//       { changeItem, setValue, same, reset, save, restore, setData },
//     ];
//   };
