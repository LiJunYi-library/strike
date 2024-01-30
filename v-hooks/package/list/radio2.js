import { ref, reactive, watch } from "vue";
import { usePromise2 } from "../promise";
import { getSelectProps } from "./select";
import { useReactive } from "../../other";

export { useRadio2, useAsyncRadio2 };

function useRadio2(props = {}) {
  const config = getSelectProps(props);
  const { formatterValue, formatterLabel, formatterDisabled } = config;
  const findForValue = (val) => (el) => config.formatterValue(el) === val;
  const findForLabel = (val) => (el) => config.formatterLabel(el) === val;
  const findIndex = (arr = [], item) => {
    const i = arr.findIndex((val) => val === item);
    return i < 0 ? undefined : i;
  };
  function resolveProps(options = config) {
    const map = {
      indexItem: undefined,
      valueItem: undefined,
      labelItem: undefined,
    };
    if (options.index !== undefined) map.indexItem = options.list[options.index];
    if (options.value !== undefined) map.valueItem = options.list.find(findForValue(options.value));
    if (options.label !== undefined) map.labelItem = options.list.find(findForLabel(options.label));
    const item = map[options.priority] || map.valueItem || map.indexItem || map.labelItem;

    if (!item && !options.list.length) return { ...options };

    const arg = {
      list: options.list,
      select: item,
      value: formatterValue(item),
      label: formatterLabel(item),
      index: findIndex(options.list, item),
    };

    return arg;
  }

  const initParms = resolveProps(config);

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

  const params = useReactive({
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
    restore_changeContextToProxy,
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
    getContext,
  });

  let context = params;

  function getContext() {
    return context;
  }

  function save() {
    store.select = params.select;
    store.value = params.value;
    store.label = params.label;
    store.index = params.index;
  }

  function restore() {
    params.select = store.select;
    params.value = store.value;
    params.label = store.label;
    params.index = store.index;
  }

  function changeContextToStore() {
    context = store;
  }

  function changeContextToProxy() {
    context = params;
  }

  function save_changeContextToStore() {
    save();
    changeContextToStore();
  }

  function restore_changeContextToProxy() {
    restore();
    changeContextToProxy();
  }

  function transform() {
    if (context === params) return (context = store);
    if (context === store) return (context = params);
  }

  function same(item, i) {
    return context.select === item;
  }

  function onSelect(item, i) {
    if (!config.Validator(context)) return;
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
    return false;
  }

  function reset() {
    context.select = undefined;
    context.value = undefined;
    context.label = undefined;
    context.index = undefined;
  }

  //  --  //
  function updateList(l, values = {}) {
    list.value = l;
    context.list = l;
    const arg = { ...config, list: l, ...values };
    const parms = resolveProps(arg);
    context.select = parms.select;
    context.value = parms.value;
    context.label = parms.label;
    context.index = parms.index;
  }

  function updateValue(val) {
    context.value = val;
    context.select = list.value.find?.(findForValue(val));
    context.label = formatterLabel(context.select);
    context.index = findIndex(list.value, context.select);
  }

  function updateLabel(val) {
    context.label = val;
    context.select = list.value.find(findForLabel(context.label));
    context.value = formatterValue(context.select);
    context.index = findIndex(list.value, context.select);
  }

  function updateIndex(val) {
    context.index = val;
    context.select = list.value[val];
    context.value = formatterValue(context.select);
    context.label = formatterLabel(context.select);
  }

  function updateSelect(val) {
    if (typeof val === "function") {
      context.select = list.value.find(val);
    } else {
      context.select = val;
    }

    context.index = findIndex(list.value, context.select);
    context.value = formatterValue(context.select);
    context.label = formatterLabel(context.select);
  }
  //  --  ///

  function getSelectOfValue(val) {
    return list.value.find?.(findForValue(val));
  }

  function getLabelOfValue(val) {
    return formatterLabel(getSelectOfValue(val));
  }

  function getIndexOfValue(val) {
    return findIndex(list.value, getSelectOfValue(val));
  }

  // -- //
  function someValue(val) {
    return list.value.some(findForValue(val));
  }

  function verifyValueInList() {
    return list.value.some(findForValue(context.value));
  }

  function resolveValue() {
    if (someValue(context.value)) {
      context.updateValue(context.value);
    } else {
      reset();
    }
  }

  function updateListToResolveValue(li) {
    list.value = li;
    context.list = li;
    resolveValue();
  }

  function updateListAndReset(li) {
    list.value = li;
    context.list = li;
    context.reset();
  }

  function resolveList(li) {
    list.value = li;
    context.list = li;
    const parms = resolveProps(context);
    context.select = parms.select;
    context.value = parms.value;
    context.label = parms.label;
    context.index = parms.index;
  }

  return params;
}

function useAsyncRadio2(props = {}) {
  const config = { fetchCb: () => undefined, ...props };
  const radioHooks = useRadio2(config);
  const asyncHooks = config.asyncHooks || usePromise2(config.fetchCb, { ...config });

  watch(
    () => asyncHooks.data,
    (data) => {
      radioHooks.updateListToResolveValue(data);
    }
  );

  const params = useReactive({
    ...radioHooks.getProto(),
    ...asyncHooks.getProto(),
  });

  return params;
}
