import { useState, useEffect, useMemo } from "react";
import { getSelectProps } from "./select";
import { ref, useProxy, refs, onCreat } from "../utils/ref";
import { computeLoading } from "../promise";
import { mergeHooks } from "../utils";
export { useMultiple, useAsyncMultiple };

function useMultiple(props = {}) {
  const config = getSelectProps(props);
  config.isMultiple = true;
  const { formatterValue, formatterLabel, formatterDisabled, isMultiple } = config;
  const someForValue = (val) => (el) => el === formatterValue(val);
  const filterForValue = (target, source) => target.filter((val) => source.some(someForValue(val)));
  const someForLabel = (val) => (el) => el === formatterLabel(val);
  const filterForLabel = (target, source) => target.filter((val) => source.some(someForLabel(val)));
  const revArray = (source) => {
    if (source instanceof Array) return source;
    if (source === 0 || source === "") return [source];
    if (source) return [source];
    return [];
  };
  const reduceIndex = (val) => (add, el, nth) => {
    if (val.some((item) => item === el)) add.push(nth);
    return add;
  };
  const reduceItem = (val) => (add, el) => {
    if (val.some((item) => item === el)) add.push(el);
    return add;
  };
  const reduceItemForValue = (val) => (add, el) => {
    if (val.some((item) => formatterValue(item) === formatterValue(el))) add.push(el);
    return add;
  };
  const isHave = (arr) => arr && arr.length > 0;
  function resolveProps(options = config, isChange = false) {
    const map = {
      indexItem: undefined,
      valueItem: undefined,
      labelItem: undefined,
    };
    const index_ = revArray(options.index);
    const value_ = revArray(options.value);
    const label_ = revArray(options.label);
    if (isHave(index_)) map.indexItem = index_.map((el) => options.list?.[el]);
    if (isHave(value_)) map.valueItem = filterForValue(options.list, value_);
    if (isHave(label_)) map.labelItem = filterForLabel(options.list, label_);
    let items;
    // eslint-disable-next-line prefer-const
    items = map[options.priority] || map.valueItem || map.indexItem || map.labelItem;
    if (!items) return { ...options, select: [], value: [], label: [], index: [] };
    const arg = {
      list: options.list,
      select: items,
      value: items.map((el) => formatterValue(el)),
      label: items.map((el) => formatterLabel(el)),
      index: options.list.reduce(reduceIndex(items), []),
    };
    return arg;
  }
  const initParms = resolveProps(config, true);
  const list = ref(initParms.list);
  const select = ref(initParms.select);
  const value = ref(initParms.value);
  const label = ref(initParms.label);
  const index = ref(initParms.index);

  const isAllSelect = () => {
    return select.value.length === list.value.length;
  };

  return onCreat(() => {
    const params = useProxy({
      list,
      select,
      value,
      label,
      index,
      memos: refs(list, select, value, label, index),
      isMultiple,
      isAllSelect,
      formatterValue,
      formatterLabel,
      formatterDisabled,
      same,
      onSelect,
      reset,
      updateList,
      updateSelect,
      updateValue,
      updateLabel,
      updateIndex,
      resolveValue,
      verifyValueInList,
      updateListAndReset,
      updateListToResolveValue,
      invertSelect,
      allSelect,

      getSelectOfValue,
      getLabelOfValue,
      getIndexOfValue,
    });

    function same(item, i) {
      return select.value.some((val) => val === item);
    }

    function onSelect(item, i) {
      const val = formatterValue(item);
      const lab = formatterLabel(item);
      if (same(item)) {
        select.value = select.value.filter((v) => v !== item);
        value.value = select.value.map((v) => formatterValue(v));
        label.value = select.value.map((v) => formatterLabel(v));
        index.value = index.value.filter((v) => v !== i);
      } else {
        select.value = [...select.value, item];
        value.value = [...select.value, val];
        label.value = [...select.value, lab];
        index.value = [...select.value, i];
      }
    }
    // 反选
    function invertSelect() {
      select.value = list.value.filter((val) => !select.value.some((el) => el === val));
      value.value = select.value.map((el) => formatterValue(el));
      label.value = select.value.map((el) => formatterLabel(el));
      index.value = list.value.reduce(reduceIndex(select.value), []);
    }
    // 全选
    function allSelect() {
      select.value = [...list.value];
      value.value = select.value.map((el) => formatterValue(el));
      label.value = select.value.map((el) => formatterLabel(el));
      index.value = list.value.map((el, nth) => nth);
    }

    function reset() {
      select.value = [];
      value.value = [];
      label.value = [];
      index.value = [];
    }

    function updateList(li, values = {}) {
      list.value = revArray(li);
      const arg = { ...config, list: list.value, ...values };
      const states = resolveProps(arg);
      select.value = states.select;
      value.value = states.value;
      label.value = states.label;
      index.value = states.index;
    }

    function updateSelect(val) {
      select.value = revArray(val);
      label.value = select.value.map((el) => formatterLabel(el));
      value.value = select.value.map((el) => formatterValue(el));
      index.value = list.value.reduce(reduceIndex(select.value), []);
    }

    function updateValue(val) {
      value.value = revArray(val);
      select.value = filterForValue(list.value, value.value);
      label.value = select.value.map((el) => formatterLabel(el));
      index.value = list.value.reduce(reduceIndex(select.value), []);
    }

    function updateLabel(val) {
      label.value = revArray(val);
      select.value = filterForLabel(list.value, label.value);
      value.value = select.value.map((el) => formatterValue(el));
      index.value = list.value.reduce(reduceIndex(select.value), []);
    }

    function updateIndex(val) {
      index.value = revArray(val);
      select.value = index.value.map((el) => list.value?.[el]);
      value.value = select.value.map((el) => formatterValue(el));
      label.value = select.value.map((el) => formatterLabel(el));
    }
    //  --  //
    function getSelectOfValue(val) {
      return filterForValue(list.value, val);
    }

    function getLabelOfValue(val) {
      return getSelectOfValue(val).map((el) => formatterLabel(el));
    }

    function getIndexOfValue(val) {
      return list.value.reduce(reduceIndex(getSelectOfValue(val)), []);
    }
    //  --  //
    function findValueArr() {
      return list.value
        .reduce(reduceItemForValue(select.value), [])
        .map((el) => formatterValue(el));
    }

    function verifyValueInList() {
      return findValueArr()?.length > 0;
    }

    function resolveValue() {
      const val = findValueArr();
      if (val.length) {
        updateValue(val);
      } else {
        reset();
      }
    }

    function updateListToResolveValue(li) {
      list.value = revArray(li);
      resolveValue();
    }

    function updateListAndReset(li) {
      updateList(li);
      reset();
    }

    return params;
  });
}

function useAsyncMultiple(props = {}) {
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

  const multipleHooks = useMultiple(config);
  const loadingHooks = computeLoading({
    promiseHooks: config.asyncHooks,
    loadingHooks: config.loadingHooks,
  });

  const hooks = onCreat(() => {
    const params = useProxy(mergeHooks(multipleHooks, config.asyncHooks, loadingHooks));
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
