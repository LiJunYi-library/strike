import { ref, watch, computed } from "vue";
import { usePromise2, useLoading } from "../promise";
import { getSelectProps } from "./select";
import { useReactive, createSaveContext } from "../../other";

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
    if (options.index !== undefined)
      map.indexItem = options.list[options.index];
    if (options.value !== undefined)
      map.valueItem = options.list.find(findForValue(options.value));
    if (options.label !== undefined)
      map.labelItem = options.list.find(findForLabel(options.label));
    const item =
      map[options.priority] || map.valueItem || map.indexItem || map.labelItem;

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

  const contextHooks = createSaveContext({ value, select, label, index });
  const methods = {
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
    getSelectOfValue,
    getLabelOfValue,
    getIndexOfValue,
    someValue,

    resolveList,
    resolveValue,
    verifyValueInList,
    updateListAndReset,
    updateListToResolveValue,
    updateListResolve,

  };

  const hooks = useReactive({
    list,
    select,
    value,
    label,
    index,
    methods,
    ...methods,
    ...contextHooks,
  });

  function same(item, i) {
   
    return hooks.context.SH.select === item;
  }

  function onSelect(item, i) {
    if (!config.Validator(hooks)) return true;
    if (config.cancelSame && same(item, i)) {
      hooks.context.SH.select = undefined;
      hooks.context.SH.index = undefined;
      hooks.context.SH.label = undefined;
      hooks.context.SH.value = undefined;
      config.onChange(hooks);
      return false;
    }
    if (same(item, i)) return true;
    hooks.context.SH.select = item;
    hooks.context.SH.index = i;
    hooks.context.SH.label = formatterLabel(item);
    hooks.context.SH.value = formatterValue(item);
    config.onChange(hooks);
    return false;
  }

  function reset() {
    hooks.context.SH.select = undefined;
    hooks.context.SH.value = undefined;
    hooks.context.SH.label = undefined;
    hooks.context.SH.index = undefined;
  }

  function updateList(l = [], values = {}) {
    list.value = l;
    const arg = { ...config, list: l, ...values };
    const args = resolveProps(arg);
    hooks.context.SH.select = args.select;
    hooks.context.SH.value = args.value;
    hooks.context.SH.label = args.label;
    hooks.context.SH.index = args.index;
  }

  function updateValue(val) {
    hooks.context.SH.value = val;
    hooks.context.SH.select = list.value.find?.(findForValue(val));
    hooks.context.SH.label = formatterLabel(hooks.context.SH.select);
    hooks.context.SH.index = findIndex(list.value, hooks.context.SH.select);
  }

  function updateLabel(val) {
    hooks.context.SH.label = val;
    hooks.context.SH.select = list.value.find(
      findForLabel(hooks.context.SH.label)
    );
    hooks.context.SH.value = formatterValue(hooks.context.SH.select);
    hooks.context.SH.index = findIndex(list.value, hooks.context.SH.select);
  }

  function updateIndex(val) {
    hooks.context.SH.index = val;
    hooks.context.SH.select = list.value[val];
    hooks.context.SH.value = formatterValue(hooks.context.SH.select);
    hooks.context.SH.label = formatterLabel(hooks.context.SH.select);
  }

  function updateSelect(val) {
    if (typeof val === "function") {
      hooks.context.SH.select = list.value.find(val);
    } else {
      hooks.context.SH.select = val;
    }

    hooks.context.SH.index = findIndex(list.value, hooks.context.SH.select);
    hooks.context.SH.value = formatterValue(hooks.context.SH.select);
    hooks.context.SH.label = formatterLabel(hooks.context.SH.select);
  }

  function resolveValue() {
    if (someValue(hooks.context.SH.value)) {
      updateValue(hooks.context.SH.value);
    } else {
      reset();
    }
  }

  function updateListToResolveValue(li = []) {
    list.value = li;
    resolveValue();
  }

  function updateListResolve(li = []) {
    list.value = li;
    const ishave = list.value.some((item) => item === hooks.context.SH.select);
    if (!ishave) return reset();
  }

  function updateListAndReset(li = []) {
    list.value = li;
    reset();
  }

  function resolveList(li= []) {
    list.value = li;
    const parms = resolveProps(hooks.context.SH);
    hooks.context.SH.select = parms.select;
    hooks.context.SH.value = parms.value;
    hooks.context.SH.label = parms.label;
    hooks.context.SH.index = parms.index;
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

  function someValue(val) {
    return list.value.some(findForValue(val));
  }

  function verifyValueInList() {
    return list.value.some(findForValue(hooks.context.SH.value));
  }

  return hooks;
}

function useAsyncRadio2(props = {}) {
  const config = {
    watchDataChange: ({ data, updateList }) => {
      updateList(data);
    },
    fetchCb: () => undefined,
    ...props,
  };

  let loadingHooks = {};
  const radioHooks = useRadio2(config);
  const asyncHooks = config.asyncHooks || usePromise2(config.fetchCb, { ...config });
  const empty = ref(false);
  asyncHooks.events.push(() => (empty.value = false));
  asyncHooks.successEvents.push(onSuccess);

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
    empty,
  });

  function onSuccess() {
    config.watchDataChange(params);
    empty.value = params.list.length === 0;
  }

  return params;
}

