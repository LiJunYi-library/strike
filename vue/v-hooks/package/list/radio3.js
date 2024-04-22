import { ref, reactive, watch } from "vue";
import { usePromise2, useLoading } from "../promise";
import { getSelectProps } from "./select";
import { useReactive } from "../../other";

export { useRadio3, useAsyncRadio3 };

function useRadio3(props = {}) {
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
  const copyHook = ref(null);

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
    copyHook,
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
    copy,
    saveValuesForCopyHook,
  });

  let context = params;

  function copy() {
    // copyHook.value = useReactive({
    //   ...params.getProto(),
    //   select: ref(params.select),
    //   value: ref(params.value),
    //   label: ref(params.label),
    //   index: ref(params.index),
    // });

    // const copy = useRadio2({
    //   select: select.value,
    //   value: value.value,
    //   label: label.value,
    //   index: index.value,
    // }).getProto();
    // copy.list = list;
    // copyHook.value = useReactive(copy);

    copyHook.value = useRadio3({
      select: select.value,
      value: value.value,
      label: label.value,
      index: index.value,
    });
    copyHook.value.list = list;
  }

  function saveValuesForCopyHook() {
    select.value = copyHook.value.select;
    value.value = copyHook.value.value;
    label.value = copyHook.value.label;
    index.value = copyHook.value.index;
  }

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

  /** 功能区 **/
  function same(item, i) {
    return select.value === item;
  }

  function onSelect(item, i) {
    if (!config.Validator(params)) return;
    if (config.cancelSame && same(item, i)) {
      select.value = undefined;
      index.value = undefined;
      label.value = undefined;
      value.value = undefined;
      config.onChange(params);
      return false;
    }
    if (same(item, i)) return true;
    select.value = item;
    index.value = i;
    label.value = formatterLabel(item);
    value.value = formatterValue(item);
    config.onChange(params);
    return false;
  }

  function reset() {
    select.value = undefined;
    value.value = undefined;
    label.value = undefined;
    index.value = undefined;
  }

  function updateValue(val) {
    value.value = val;
    select.value = list.value.find?.(findForValue(val));
    label.value = formatterLabel(select.value);
    index.value = findIndex(list.value, select.value);
  }

  function updateLabel(val) {
    label.value = val;
    select.value = list.value.find(findForLabel(label.value));
    value.value = formatterValue(select.value);
    index.value = findIndex(list.value, select.value);
  }

  function updateIndex(val) {
    index.value = val;
    select.value = list.value[val];
    value.value = formatterValue(select.value);
    label.value = formatterLabel(select.value);
  }

  function updateSelect(val) {
    if (typeof val === "function") {
      select.value = list.value.find(val);
    } else {
      select.value = val;
    }

    index.value = findIndex(list.value, select.value);
    value.value = formatterValue(select.value);
    label.value = formatterLabel(select.value);
  }

  function updateList(l, values = {}) {
    list.value = l;
    const arg = { ...config, list: l, ...values };
    const parms = resolveProps(arg);
    select.value = parms.select;
    value.value = parms.value;
    label.value = parms.label;
    index.value = parms.index;
    resolveCopyHook();
  }

  //
  function resolveCopyHook() {
    if (!copyHook.value) return;
    copyHook.value.select = select.value;
    copyHook.value.value = value.value;
    copyHook.value.label = label.value;
    copyHook.value.index = index.value;
  }

  function updateListToResolveValue(li) {
    list.value = li;
    resolveValue();
    resolveCopyHook();
  }

  function updateListAndReset(li) {
    list.value = li;
    reset();
    resolveCopyHook();
  }

  function resolveList(li) {
    list.value = li;
    const args = resolveProps(params);
    select.value = args.select;
    value.value = args.value;
    label.value = args.label;
    index.value = args.index;
    resolveCopyHook();
  }

  function verifyValueInList() {
    return list.value.some(findForValue(value.value));
  }

  function resolveValue(val = value.value) {
    if (someValue(val)) updateValue(val);
    else reset();
  }

  /** 功能区 **/

  /** 辅助区 **/
  function getSelectOfValue(val) {
    return list.value.find?.(findForValue(val));
  }

  function getLabelOfValue(val) {
    return formatterLabel(getSelectOfValue(val));
  }

  function getIndexOfValue(val) {
    return findIndex(list.value, getSelectOfValue(val));
  }

  function someValue(val) {
    return list.value.some(findForValue(val));
  }
  /** 辅助区 **/

  return params;
}

function useAsyncRadio3(props = {}) {
  const config = {
    watchDataCb: ({ data, updateList }) => {
      updateList(data);
    },
    fetchCb: () => undefined,
    ...props,
  };
  const radioHooks = useRadio3(config);
  const asyncHooks = config.asyncHooks || usePromise2(config.fetchCb, { ...config });
  let loadingHooks = {};
  if (config.loadingHooks) {
    loadingHooks = useLoading({
      loadingHook: config.loadingHooks,
      promiseHook: asyncHooks,
    });
  }

  const params = useReactive({
    ...radioHooks?.getProto?.(),
    ...asyncHooks?.getProto?.(),
    ...loadingHooks?.getProto?.(),
  });

  watch(
    () => asyncHooks.data,
    (data) => {
      config.watchDataCb(params, data);
    }
  );

  return params;
}
