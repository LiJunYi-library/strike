import { useState, useEffect, useMemo } from "react";
import { getSelectProps } from "./select";
import { ref, onCreat, useProxy, refs } from "../utils/ref";
import { computeLoading } from "../promise";
import { mergeHooks } from "../utils";

export { useRadio, useAsyncRadio };

const findIndex = (arr = [], item) => {
  const i = arr.findIndex((val) => val === item);
  return i < 0 ? undefined : i;
};

function useRadio(props = {}) {
  const [config] = useState(getSelectProps(props));
  const { formatterValue, formatterLabel, formatterDisabled } = config;
  const findForValue = (val) => (el) => config.formatterValue(el) === val;
  const findForLabel = (val) => (el) => config.formatterLabel(el) === val;
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

  const [initParms] = useState(resolveProps(config, true));
  const list = ref(initParms.list);
  const select = ref(initParms.select);
  const value = ref(initParms.value);
  const label = ref(initParms.label);
  const index = ref(initParms.index);

  return onCreat(() => {
    const params = useProxy({
      list,
      select,
      value,
      label,
      index,
      memos: refs(list, select, value, label, index),
      formatterValue,
      formatterLabel,
      formatterDisabled,
      same,
      onSelect,
      reset,
      updateValue,
      updateLabel,
      updateIndex,
      updateSelect,
      updateList,
      updateListToResolveValue,
      updateListAndReset,
      verifyValueInList,
      //
      getSelectOfValue,
      getLabelOfValue,
      getIndexOfValue,
      someValue,
    });

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

    function resolveCopyHook() {
      // if (!copyHook.value) return;
      // copyHook.value.select = select.value;
      // copyHook.value.value = value.value;
      // copyHook.value.label = label.value;
      // copyHook.value.index = index.value;
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

    function verifyValueInList() {
      return list.value.some(findForValue(value.value));
    }

    function resolveValue(val = value.value) {
      if (someValue(val)) updateValue(val);
      else reset();
    }

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
  });
}

function useAsyncRadio(props) {
  const [config] = useState({
    watchDataCb: ({ data, updateList }) => {
      try {
        updateList(data);
      } catch (error) {
        // console.warn(error);
      }
    },
    fetchCb: () => undefined,
    ...props,
  });

  const radioHooks = useRadio(config);
  const loadingHooks = computeLoading({
    promiseHooks: config.asyncHooks,
    loadingHooks: config.loadingHooks,
  });

  const hooks = onCreat(() => {
    const params = useProxy(mergeHooks(radioHooks, config.asyncHooks, loadingHooks));
    return params;
  });

  useMemo(() => {
    config.successFun = () => {
      config.watchDataCb(hooks);
    };
    config.asyncHooks?.events?.push?.(config.successFun);
  }, []);

  useEffect(() => {
    return () => {
      config.asyncHooks?.events?.remove?.(config.successFun);
    };
  }, []);

  return hooks;
}
