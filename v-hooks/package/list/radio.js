import { ref, reactive, computed } from "vue";
import { usePromise, getPromiseConfig, useInterceptPromiseApply } from "../promise";
import { getSelectProps } from "./select";
export { useRadio, useAsyncRadio };

function useRadio(props = {}) {
  const config = getSelectProps(props);
  const { formatterValue, formatterLabel } = config;
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
    if (options.index >= 0) map.indexItem = options.list[options.index];
    if (options.value) map.valueItem = options.list.find(findForValue(options.value));
    if (options.label) map.labelItem = options.list.find(findForLabel(options.label));
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
  // console.log("initParms", initParms.value);

  const list = ref(initParms.list);
  const select = ref(initParms.select);
  const value = ref(initParms.value);
  const label = ref(initParms.label);
  const index = ref(initParms.index);

  let store = {
    list: [],
    select: null,
    value: null,
    label: null,
    index: null,
  };

  const save = () => {
    store = {
      list: [...list.value],
      select: select.value,
      value: value.value,
      label: label.value,
      index: index.value,
    };
    // console.log('save', store);
  };

  const restore = () => {
    list.value = [...store.list];
    select.value = store.select;
    value.value = store.value;
    label.value = store.label;
    index.value = store.index;
    // console.log('restore', store);
  };

  save();

  const same = (item, i) => {
    return select.value === item;
  };

  const onSelect = (item, i) => {
    if (config.cancelSame && same(item, i)) {
      select.value = undefined;
      index.value = undefined;
      label.value = undefined;
      value.value = undefined;
      return;
    }
    if (same(item, i)) return;
    // console.log("onSelect");
    select.value = item;
    index.value = i;
    label.value = formatterLabel(item);
    value.value = formatterValue(item);
  };

  const arguments_ = {
    list,
    select,
    value,
    label,
    index,
    store,
    save,
    restore,
    onSelect,
    same,
    formatterValue,
    formatterLabel,
    updateList,
    updateValue,
    updateIndex,
    updateLabel,
    resolveList,
    resolveValue,
    verifyValueInList,
    updateListToResolveValue,
  };
  const proxy = reactive(arguments_);
  arguments_.proxy = proxy;

  function verifyValueInList() {
    return list.value.some(findForValue(value.value));
  }

  function reset() {
    select.value = undefined;
    value.value = undefined;
    label.value = undefined;
    index.value = undefined;
  }

  function updateListToResolveValue(l) {
    list.value = l;
    resolveValue();
  }

  function updateValue(val) {
    value.value = val;
    select.value = list.value.find?.(findForValue(val));
    label.value = formatterLabel(select.value);
    index.value = findIndex(list.value, select.value);
  }

  function resolveValue() {
    if (verifyValueInList()) {
      updateValue(value.value);
    } else {
      reset();
    }
  }

  function updateList(l) {
    list.value = l;
    const arg = { ...config, list: l };
    const parms = resolveProps(arg);
    select.value = parms.select;
    value.value = parms.value;
    label.value = parms.label;
    index.value = parms.index;
  }

  function resolveList(l) {
    list.value = l;
    const parms = resolveProps(proxy);
    select.value = parms.select;
    value.value = parms.value;
    label.value = parms.label;
    index.value = parms.index;
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

  return arguments_;
}

function useAsyncRadio(props) {
  const radioHooks = useRadio(props);

  const asyncHooks = useInterceptPromiseApply({
    ...props,
    listenerMethods: props.fetchListMethods,
    then: (data) => {
      radioHooks.updateList(data);
    },
  });

  const disabledHooks = useInterceptPromiseApply({ listenerMethods: props.disabledMethods });

  const arguments_ = { ...radioHooks, ...asyncHooks, disabled: disabledHooks.loading };
  arguments_.proxy = reactive(arguments_);
  return arguments_;
}
