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
    transform,
    transformStore,
    transformParams,
    save,
    restore,
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
    resolveList, // 废弃
    resolveValue,
    verifyValueInList,
    updateListAndReset,
    updateListToResolveValue,
    selectOfValue,
    labelOfValue,
    indexOfValue,
  };

  params.proxy = reactive(params);

  let argument = params.proxy;

  function save() {
    store.list = [...params.proxy.list];
    store.select = params.proxy.select;
    store.value = params.proxy.value;
    store.label = params.proxy.label;
    store.index = params.proxy.index;
  }

  function transformStore() {
    argument = store;
  }

  function transformParams() {
    argument = params.proxy;
  }

  function transform() {
    if (argument === params.proxy) return (argument = store);
    if (argument === store) return (argument = params.proxy);
  }

  function restore() {
    params.proxy.list = [...store.list];
    params.proxy.select = store.select;
    params.proxy.value = store.value;
    params.proxy.label = store.label;
    params.proxy.index = store.index;
  }

  function same(item, i) {
    return argument.select === item;
  }

  function onSelect(item, i) {
    if (config.cancelSame && same(item, i)) {
      argument.select = undefined;
      argument.index = undefined;
      argument.label = undefined;
      argument.value = undefined;
      config.onChange(argument);
      return;
    }
    if (same(item, i)) return;
    argument.select = item;
    argument.index = i;
    argument.label = formatterLabel(item);
    argument.value = formatterValue(item);
    config.onChange(argument);
  }

  function reset() {
    argument.select = undefined;
    argument.value = undefined;
    argument.label = undefined;
    argument.index = undefined;
  }

  function updateList(l) {
    argument.list = l;
    const arg = { ...config, list: l };
    const parms = resolveProps(arg);
    argument.select = parms.select;
    argument.value = parms.value;
    argument.label = parms.label;
    argument.index = parms.index;
  }

  function updateValue(val) {
    argument.value = val;
    argument.select = argument.list.find?.(findForValue(val));
    argument.label = formatterLabel(argument.select);
    argument.index = findIndex(argument.list, argument.select);
  }

  function selectOfValue(val) {
    return argument.list.find?.(findForValue(val));
  }

  function labelOfValue(val) {
    return formatterLabel(selectOfValue(val));
  }

  function indexOfValue(val) {
    return findIndex(argument.list, selectOfValue(val));
  }

  function updateLabel(val) {
    argument.label = val;
    argument.select = argument.list.find(findForLabel(argument.label));
    argument.value = formatterValue(argument.select);
    argument.index = findIndex(argument.list, argument.select);
  }

  function updateIndex(val) {
    argument.index = val;
    argument.select = argument.list[val];
    argument.value = formatterValue(argument.select);
    argument.label = formatterLabel(argument.select);
  }

  function updateSelect(val) {
    argument.select = val;
    argument.index = findIndex(argument.list, argument.select);
    argument.value = formatterValue(argument.select);
    argument.label = formatterLabel(argument.select);
  }

  function verifyValueInList() {
    return argument.list.some(findForValue(argument.value));
  }

  function resolveValue() {
    if (verifyValueInList()) {
      argument.updateValue(argument.value);
    } else {
      reset();
    }
  }

  function updateListToResolveValue(l) {
    argument.list = l;
    argument.resolveValue();
  }

  function updateListAndReset(li) {
    argument.list = li;
    argument.reset();
  }

  function resolveList(l) {
    argument.list = l;
    const parms = resolveProps(argument);
    argument.select = parms.select;
    argument.value = parms.value;
    argument.label = parms.label;
    argument.index = parms.index;
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
