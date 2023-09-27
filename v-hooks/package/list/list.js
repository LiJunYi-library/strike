import { ref, reactive, computed, watch } from "vue";
import { usePromise, getPromiseConfig, useInterceptPromiseApply } from "../promise";
import { useSelect } from "./select";

export { getListProps, useList };

function getListProps(options = {}) {
  const config = {
    ...options,
    afterSetList: () => undefined,
    listStorage: options.list || [],
  };
  return config;
}

function useList(props = {}) {
  const config = getListProps(props);
  let filterFun;

  const listStorage = ref(config.listStorage);
  const list = ref(config.list);

  const arguments_ = {
    listStorage,
    list,
    afterSetList: config.afterSetList,
    updateList,
    reset,
    remove,
    pop,
    shift,
    push,
    unshift,
    filter,
    filterIncludes,
    filterRegExp,
    sort,
    ascendingOrder,
    descendingOrder,
  };
  arguments_.proxy = reactive(arguments_);

  function getList() {
    const list_ = listStorage.value;
    // if( filterFun) list_ = listStorage.value.filter(filterFun);
    return list_;
  }

  function updateList(l) {
    listStorage.value = l;
    list.value = listStorage.value;
    arguments_.afterSetList(arguments_);
  }

  function reset() {
    list.value = listStorage.value;
    arguments_.afterSetList(arguments_);
  }

  /////////////////////////////////////
  /**增加**/
  /////////////////////////////////////
  function push(...args) {
    listStorage.value.push(...args);
    list.value = getList();
    arguments_.afterSetList(arguments_);
  }

  function unshift(...args) {
    listStorage.value.unshift(...args);
    list.value = getList();
    arguments_.afterSetList(arguments_);
  }

  /////////////////////////////////////
  /**删除**/
  /////////////////////////////////////
  function pop() {
    listStorage.value.pop();
    list.value = getList();
    arguments_.afterSetList(arguments_);
  }

  function shift() {
    listStorage.value.shift();
    list.value = getList();
    arguments_.afterSetList(arguments_);
  }

  function remove(...args) {
    const list_ = listStorage.value.filter((el) => !args.includes(el));
    listStorage.value = list_;
    list.value = getList();
    arguments_.afterSetList(arguments_);
  }

  /////////////////////////////////////
  /**修改**/
  /////////////////////////////////////

  /////////////////////////////////////
  /**查找**/
  /////////////////////////////////////
  function filter(fun) {
    filterFun = fun;
    list.value = listStorage.value.filter(fun);
    arguments_.afterSetList(arguments_, 0);
  }

  function filterIncludes(formatter, key, isOr) {
    filterFun = (el, index) => {
      const keyWord = formatter(el) || "";
      const keyWords = keyWord.split(" ").filter(Boolean);
      if (isOr) return keyWords.some((str) => str.includes(key));
      return keyWords.every((str) => str.includes(key));
    };
    list.value = listStorage.value.filter(filterFun);
    arguments_.afterSetList(arguments_, 0);
  }

  function filterRegExp(formatter, regExp) {
    filterFun = (el, index) => {
      const keyWord = formatter(el) || "";
      return regExp.test(keyWord);
    };
    list.value = listStorage.value.filter(filterFun);
    arguments_.afterSetList(arguments_, 0);
  }

  /////////////////////////////////////
  /**排序**/
  /////////////////////////////////////
  function sort(fun) {
    list.value = listStorage.value.sort(fun);
    arguments_.afterSetList(arguments_);
  }

  function ascendingOrder(formatter) {
    list.value = listStorage.value.sort((a, b) => formatter(a) - formatter(b));
    arguments_.afterSetList(arguments_);
  }

  function descendingOrder(formatter) {
    list.value = listStorage.value.sort((a, b) => formatter(b) - formatter(a));
    arguments_.afterSetList(arguments_);
  }

  return arguments_;
}
