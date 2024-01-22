import { ref, reactive, computed, watch } from "vue";
import { usePromise, getPromiseConfig, useInterceptPromiseApply } from "../promise";
import { useSelect } from "./select";
import { useProxy } from "../../other";

export { getListProps, useList };

function getListProps(options = {}) {
  const config = {
    afterSetList: () => undefined,
    ...options,
    list: options.list || [],
    listStorage: options.list || [],
  };
  return config;
}

function useList(props = {}) {
  const config = getListProps(props);

  const listStorage = ref([...config.list]);
  const list = ref(config.list);
  const sortFun = ref();
  const filterFun = ref();

  const params = useProxy({
    filterFun,
    sortFun,
    //
    listStorage,
    list,
    afterSetList: config.afterSetList,
    updateList,
    reset,
    //
    push,
    unshift,
    //
    remove,
    pop,
    shift,
    //
    filter,
    // filterIncludes,
    // filterRegExp,
    sort,
    ascendingOrder,
    descendingOrder,
  });

  function getList() {
    let list_ = [...listStorage.value];
    if (filterFun.value) list_ = list_.filter(filterFun.value);
    if (sortFun.value) list_ = list_.sort(sortFun.value);
    return list_;
  }

  function updateList(l) {
    listStorage.value = l;
    list.value = listStorage.value;
  }

  function reset() {
    list.value = [...listStorage.value];
    clearSort();
    clearFilter();
  }

  function clearSort() {
    sortFun.value = null;
  }

  function clearFilter() {
    filterFun.value = null;
  }

  /////////////////////////////////////
  /**增加**/
  /////////////////////////////////////
  function push(...args) {
    listStorage.value.push(...args);
    list.value = getList();
  }

  function unshift(...args) {
    listStorage.value.unshift(...args);
    list.value = getList();
  }

  /////////////////////////////////////
  /**删除**/
  /////////////////////////////////////
  function pop() {
    const item = list.value.at(-1);
    remove(item);
  }

  function shift() {
    const item = list.value[0];
    remove(item);
  }

  function remove(...args) {
    listStorage.value = listStorage.value.filter((el) => !args.includes(el));
    list.value = list.value.filter((el) => !args.includes(el));
  }

  /////////////////////////////////////
  /**修改**/
  /////////////////////////////////////

  /////////////////////////////////////
  /**查找**/
  /////////////////////////////////////
  function filter(fun) {
    filterFun.value = fun;
    list.value = listStorage.value.filter(fun);
    if (sortFun.value) list.value.sort(sortFun.value);
    params.afterSetList(params, 0);
  }

  /////////////////////////////////////
  /**排序**/
  /////////////////////////////////////
  function sort(fun) {
    sortFun.value = fun;
    // list.value = listStorage.value.sort(fun);
    list.value.sort(fun);
    console.log(listStorage.value);
    params.afterSetList(params);
  }

  function ascendingOrder(formatter) {
    sortFun.value = (a, b) => formatter(a) - formatter(b);
    // list.value = listStorage.value.sort((a, b) => formatter(a) - formatter(b));
    list.value.sort(sortFun.value);
    console.log(listStorage.value);
    params.afterSetList(params);
  }

  function descendingOrder(formatter) {
    sortFun.value = (a, b) => formatter(b) - formatter(a);
    // list.value = listStorage.value.sort((a, b) => formatter(b) - formatter(a));
    list.value.sort(sortFun.value);
    console.log(listStorage.value);
    params.afterSetList(params);
  }

  return params;
}

// function filterIncludes(formatter, key, isOr) {
//   filterFun = (el, index) => {
//     const keyWord = formatter(el) || "";
//     const keyWords = keyWord.split(" ").filter(Boolean);
//     if (isOr) return keyWords.some((str) => str.includes(key));
//     return keyWords.every((str) => str.includes(key));
//   };
//   list.value = listStorage.value.filter(filterFun);
//   params.afterSetList(params, 0);
// }

// function filterRegExp(formatter, regExp) {
//   filterFun = (el, index) => {
//     const keyWord = formatter(el) || "";
//     return regExp.test(keyWord);
//   };
//   list.value = listStorage.value.filter(filterFun);
//   params.afterSetList(params, 0);
// }
