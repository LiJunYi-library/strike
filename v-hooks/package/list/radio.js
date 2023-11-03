import { ref, reactive } from "vue";
import { usePromise } from "../promise";
import { getSelectProps } from "./select";
export { useRadio, useAsyncRadio };

function useRadio(props = {}) {
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
  const list = ref(initParms.list);
  const select = ref(initParms.select);
  const value = ref(initParms.value);
  const label = ref(initParms.label);
  const index = ref(initParms.index);

  const store = reactive({
    list: [],
    select: null,
    value: null,
    label: null,
    index: null,
  });

  const params = {
    list,
    select,
    value,
    label,
    index,
    store,
    transform, // 废弃
    transformStore: changeContextToStore, // 废弃
    changeContextToStore,
    transformParams: changeContextToProxy, // 废弃
    changeContextToProxy,
    save,
    restore,
    save_changeContextToStore,
    onSelect,
    same,
    reset,
    formatterValue,
    formatterLabel,
    formatterDisabled,
    updateList,
    updateValue,
    updateIndex,
    updateLabel,
    updateSelect,
    resolveList,
    resolveValue,
    verifyValueInList,
    updateListAndReset,
    updateListToResolveValue,
    getSelectOfValue,
    selectOfValue: getSelectOfValue, // 废弃
    getLabelOfValue,
    labelOfValue: getLabelOfValue, // 废弃
    getIndexOfValue,
    indexOfValue: getIndexOfValue, // 废弃
    someValue,
  };

  params.proxy = reactive(params);

  let context = params.proxy;

  function save() {
    // store.list = [...params.proxy.list];
    store.select = params.proxy.select;
    store.value = params.proxy.value;
    store.label = params.proxy.label;
    store.index = params.proxy.index;
  }

  function restore() {
    // params.proxy.list = [...store.list];
    params.proxy.select = store.select;
    params.proxy.value = store.value;
    params.proxy.label = store.label;
    params.proxy.index = store.index;
  }

  function changeContextToStore() {
    context = store;
    // console.log("changeContextToProxy");
  }

  function changeContextToProxy() {
    context = params.proxy;
    // console.log("changeContextToProxy");
  }

  function save_changeContextToStore() {
    save();
    changeContextToStore();
  }

  function transform() {
    if (context === params.proxy) return (context = store);
    if (context === store) return (context = params.proxy);
  }

  function same(item, i) {
    return context.select === item;
  }

  function onSelect(item, i) {
    if (config.cancelSame && same(item, i)) {
      context.select = undefined;
      context.index = undefined;
      context.label = undefined;
      context.value = undefined;
      config.onChange(context);
      return false;
    }
    if (same(item, i)) return true;
    context.select = item;
    context.index = i;
    context.label = formatterLabel(item);
    context.value = formatterValue(item);
    config.onChange(context);
    // console.log("onSelect", context);
    return false;
  }

  function reset() {
    context.select = undefined;
    context.value = undefined;
    context.label = undefined;
    context.index = undefined;
  }

  //  --  ///
  function updateList(l) {
    context.list = l;
    list.value = l;
    const arg = { ...config, list: l };
    const parms = resolveProps(arg);
    context.select = parms.select;
    context.value = parms.value;
    context.label = parms.label;
    context.index = parms.index;
  }

  function updateValue(val) {
    context.value = val;
    context.select = context.list.find?.(findForValue(val));
    context.label = formatterLabel(context.select);
    context.index = findIndex(context.list, context.select);
  }

  function updateLabel(val) {
    context.label = val;
    context.select = context.list.find(findForLabel(context.label));
    context.value = formatterValue(context.select);
    context.index = findIndex(context.list, context.select);
  }

  function updateIndex(val) {
    context.index = val;
    context.select = context.list[val];
    context.value = formatterValue(context.select);
    context.label = formatterLabel(context.select);
  }

  function updateSelect(val) {
    if (typeof val === "function") {
      context.select = context.list.find(val);
    } else {
      context.select = val;
    }

    context.index = findIndex(context.list, context.select);
    context.value = formatterValue(context.select);
    context.label = formatterLabel(context.select);
  }
  //  --  ///

  function getSelectOfValue(val) {
    return context.list.find?.(findForValue(val));
  }

  function getLabelOfValue(val) {
    return formatterLabel(getSelectOfValue(val));
  }

  function getIndexOfValue(val) {
    return findIndex(context.list, getSelectOfValue(val));
  }

  // -- //
  function someValue(val) {
    return context.list.some(findForValue(val));
  }

  function verifyValueInList() {
    return context.list.some(findForValue(context.value));
  }

  function resolveValue() {
    if (someValue(context.value)) {
      context.updateValue(context.value);
    } else {
      reset();
    }
  }

  function updateListToResolveValue(l) {
    context.list = l;
    list.value = l;
    resolveValue();
  }

  function updateListAndReset(li) {
    context.list = li;
    list.value = l;
    context.reset();
  }

  function resolveList(l) {
    context.list = l;
    list.value = l;
    const parms = resolveProps(context);
    context.select = parms.select;
    context.value = parms.value;
    context.label = parms.label;
    context.index = parms.index;
  }

  return params;
}

function useAsyncRadio(props = {}) {
  const config = {
    fetchCb: () => undefined,
    ...props,
  };

  const radioHooks = useRadio(config);

  const asyncHooks = usePromise(config.fetchCb, {
    then: (data) => {
      radioHooks.updateListToResolveValue(data);
    },
    ...config,
  });

  const params = { ...radioHooks, ...asyncHooks };
  params.proxy = reactive(params);
  return params;
}
