import React, { useState, useEffect, useMemo } from "react";
import { getSelectProps } from "./select";

export { useRadio };

function useRadio(props = {}) {
  console.log("useRadio");
  const config = getSelectProps(props);
  const { formatterValue, formatterLabel, formatterDisabled } = config;
  const findForValue = (val) => (el) => config.formatterValue(el) === val;
  const findForLabel = (val) => (el) => config.formatterLabel(el) === val;
  const findIndex = (arr = [], item) => {
    const i = arr.findIndex((val) => val === item);
    return i < 0 ? undefined : i;
  };
  function resolveProps(options = config, isChange = false) {
    const map = {
      indexItem: undefined,
      valueItem: undefined,
      labelItem: undefined,
    };
    if (options.index !== undefined) map.indexItem = options.list[options.index];
    if (options.value !== undefined) map.valueItem = options.list.find(findForValue(options.value));
    if (options.label !== undefined) map.labelItem = options.list.find(findForLabel(options.label));
    let item;
    if (!isChange) item = map[options.priority] || map.valueItem || map.labelItem;
    if (isChange) item = map[options.priority] || map.valueItem || map.indexItem || map.labelItem;

    if (!item && !options.list.length && isChange) return { ...options };

    const arg = {
      list: options.list,
      select: item,
      value: formatterValue(item),
      label: formatterLabel(item),
      index: findIndex(options.list, item),
    };

    return arg;
  }

  const initParms = resolveProps(config, true);
  const [list, setList] = useState(initParms.list);

  const [select, setSelect] = useState(initParms.select);
  const [value, setValue] = useState(initParms.value);
  const [label, setLabel] = useState(initParms.label);
  const [index, setIndex] = useState(initParms.index);
  const params = {
    select,
    setSelect,
    value,
    setValue,
    label,
    setLabel,
    index,
    setIndex,
  };

  const store = (() => {
    const [select, setSelect] = useState();
    const [value, setValue] = useState();
    const [label, setLabel] = useState();
    const [index, setIndex] = useState();
    return {
      select,
      setSelect,
      value,
      setValue,
      label,
      setLabel,
      index,
      setIndex,
    };
  })();

  const hooks = {
    ...params,
    list,
    setList,
    onSelect,
    same,
    reset,
    use,
    // store,
    // transform, // 废弃
    // transformStore: changeContextToStore, // 废弃
    // changeContextToStore,
    // transformParams: changeContextToProxy, // 废弃
    // changeContextToProxy,
    // save,
    // restore,
    // save_changeContextToStore,
    // formatterValue,
    // formatterLabel,
    // formatterDisabled,
    // updateList,
    updateValue,
    // updateIndex,
    // updateLabel,
    // updateSelect,
    // resolveList,
    // resolveValue,
    // verifyValueInList,
    // updateListAndReset,
    // updateListToResolveValue,
    // getSelectOfValue,
    // selectOfValue: getSelectOfValue, // 废弃
    // getLabelOfValue,
    // labelOfValue: getLabelOfValue, // 废弃
    // getIndexOfValue,
    // indexOfValue: getIndexOfValue, // 废弃
    // someValue,
  };

  let context = params;

  function same(item, i) {
    return context.select === item;
  }

  function onSelect(item, i) {
    if (config.cancelSame && same(item, i)) {
      reset();
      config.onChange(context);
      return false;
    }
    if (same(item, i)) return true;
    context.setSelect(item);
    context.setValue(formatterValue(item));
    context.setLabel(formatterLabel(item));
    context.setIndex(i);
    config.onChange(context);
    return false;
  }

  function reset() {
    context.setSelect(undefined);
    context.setValue(undefined);
    context.setLabel(undefined);
    context.setIndex(undefined);
  }

  function updateValue(val) {
    context.setValue(val);
    context.setSelect(list.find?.(findForValue(val)));
    context.setLabel(formatterLabel(context.select));
    context.setIndex(findIndex(list, context.select));
  }

  function use() {
    const [select, setSelect] = useState(params.select);
    const [value, setValue] = useState(params.value);
    const [label, setLabel] = useState(params.label);
    const [index, setIndex] = useState(params.index);
    params.select = select;
    params.setSelect = setSelect;
    params.value = value;
    params.setValue = setValue;
    params.label = label;
    params.setLabel = setLabel;
    params.index = index;
    params.setIndex = setIndex;
    Object.assign(hooks, params);
  }

  return hooks;

  // function save() {
  //   // store.list = [...params.proxy.list];
  //   store.select = params.proxy.select;
  //   store.value = params.proxy.value;
  //   store.label = params.proxy.label;
  //   store.index = params.proxy.index;
  // }

  // function restore() {
  //   // params.proxy.list = [...store.list];
  //   params.proxy.select = store.select;
  //   params.proxy.value = store.value;
  //   params.proxy.label = store.label;
  //   params.proxy.index = store.index;
  // }

  // function changeContextToStore() {
  //   context = store;
  //   // console.log("changeContextToProxy");
  // }

  // function changeContextToProxy() {
  //   context = params.proxy;
  //   // console.log("changeContextToProxy");
  // }

  // function save_changeContextToStore() {
  //   save();
  //   changeContextToStore();
  // }

  // function transform() {
  //   if (context === params.proxy) return (context = store);
  //   if (context === store) return (context = params.proxy);
  // }

  // //  --  ///
  // function updateList(l) {
  //   list.value = l;
  //   context.list = l;
  //   const arg = { ...config, list: l };
  //   const parms = resolveProps(arg);
  //   context.select = parms.select;
  //   context.value = parms.value;
  //   context.label = parms.label;
  //   context.index = parms.index;
  // }

  // function updateLabel(val) {
  //   context.label = val;
  //   context.select = list.value.find(findForLabel(context.label));
  //   context.value = formatterValue(context.select);
  //   context.index = findIndex(list.value, context.select);
  // }

  // function updateIndex(val) {
  //   context.index = val;
  //   context.select = list.value[val];
  //   context.value = formatterValue(context.select);
  //   context.label = formatterLabel(context.select);
  // }

  // function updateSelect(val) {
  //   if (typeof val === "function") {
  //     context.select = list.value.find(val);
  //   } else {
  //     context.select = val;
  //   }

  //   context.index = findIndex(list.value, context.select);
  //   context.value = formatterValue(context.select);
  //   context.label = formatterLabel(context.select);
  // }
  // //  --  ///

  // function getSelectOfValue(val) {
  //   return list.value.find?.(findForValue(val));
  // }

  // function getLabelOfValue(val) {
  //   return formatterLabel(getSelectOfValue(val));
  // }

  // function getIndexOfValue(val) {
  //   return findIndex(list.value, getSelectOfValue(val));
  // }

  // // -- //
  // function someValue(val) {
  //   return list.value.some(findForValue(val));
  // }

  // function verifyValueInList() {
  //   return list.value.some(findForValue(context.value));
  // }

  // function resolveValue() {
  //   if (someValue(context.value)) {
  //     context.updateValue(context.value);
  //   } else {
  //     reset();
  //   }
  // }

  // function updateListToResolveValue(li) {
  //   list.value = li;
  //   context.list = li;
  //   resolveValue();
  // }

  // function updateListAndReset(li) {
  //   list.value = li;
  //   context.list = li;
  //   context.reset();
  // }

  // function resolveList(li) {
  //   list.value = li;
  //   context.list = li;
  //   const parms = resolveProps(context);
  //   context.select = parms.select;
  //   context.value = parms.value;
  //   context.label = parms.label;
  //   context.index = parms.index;
  // }
}
