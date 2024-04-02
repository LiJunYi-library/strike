import { ref, reactive, watch, computed } from "vue";
import { usePromise2, useLoading } from "../promise";
import { getSelectProps } from "./select";
import { useReactive, createSaveContext } from "../../other";

export { useMultiple2, useAsyncMultiple2 };

function useMultiple2(props = {}) {
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

  function resolveProps(options = config) {
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
    if (options.isCheckAll) map.valueItem = options.list;
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

  const initParms = resolveProps(config);
  const list = ref(initParms.list);
  const select = ref(initParms.select);
  const value = ref(initParms.value);
  const label = ref(initParms.label);
  const index = ref(initParms.index);
  const contextHooks = createSaveContext({ value, select, label, index });

  const hooks = useReactive({
    list,
    select,
    value,
    label,
    index,
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
    selectOfValue,
    labelOfValue,
    indexOfValue,
    getSelectOfValue: selectOfValue,
    getLabelOfValue: labelOfValue,
    getIndexOfValue: indexOfValue,
    ...contextHooks,
  });

  function isAllSelect() {
    return hooks.context.SH.select.length === list.value.length;
  }

  //
  function same(item, i) {
    return hooks.context.SH.select.some((val) => val === item);
  }

  function onSelect(item, i) {
    const val = formatterValue(item);
    const lab = formatterLabel(item);
    if (same(item)) {
      hooks.context.SH.select = hooks.context.SH.select.filter((v) => v !== item);
      hooks.context.SH.value = hooks.context.SH.select.map((v) => formatterValue(v));
      hooks.context.SH.label = hooks.context.SH.select.map((v) => formatterLabel(v));
      hooks.context.SH.index = hooks.context.SH.index.filter((v) => v !== i);
    } else {
      hooks.context.SH.select.push(item);
      hooks.context.SH.value.push(val);
      hooks.context.SH.label.push(lab);
      hooks.context.SH.index.push(i);
    }
  }
  // 反选
  function invertSelect() {
    hooks.context.SH.select = list.value.filter(
      (val) => !hooks.context.SH.select.some((el) => el === val)
    );
    hooks.context.SH.value = hooks.context.SH.select.map((el) => formatterValue(el));
    hooks.context.SH.label = hooks.context.SH.select.map((el) => formatterLabel(el));
    hooks.context.SH.index = list.value.reduce(reduceIndex(hooks.context.SH.select), []);
  }
  // 全选
  function allSelect() {
    hooks.context.SH.select = [...list.value];
    hooks.context.SH.value = hooks.context.SH.select.map((el) => formatterValue(el));
    hooks.context.SH.label = hooks.context.SH.select.map((el) => formatterLabel(el));
    hooks.context.SH.index = list.value.map((el, nth) => nth);
  }

  function reset() {
    hooks.context.SH.select = [];
    hooks.context.SH.value = [];
    hooks.context.SH.label = [];
    hooks.context.SH.index = [];
  }

  function updateList(li, values = {}) {
    list.value = revArray(li);
    const arg = { ...config, list: list.value, ...values };
    const parms = resolveProps(arg);
    hooks.context.SH.select = parms.select;
    hooks.context.SH.value = parms.value;
    hooks.context.SH.label = parms.label;
    hooks.context.SH.index = parms.index;
  }

  function updateSelect(val) {
    hooks.context.SH.select = revArray(val);
    hooks.context.SH.label = hooks.context.SH.select.map((el) => formatterLabel(el));
    hooks.context.SH.value = hooks.context.SH.select.map((el) => formatterValue(el));
    hooks.context.SH.index = list.value.reduce(reduceIndex(hooks.context.SH.select), []);
  }

  function updateValue(val) {
    hooks.context.SH.value = revArray(val);
    hooks.context.SH.select = filterForValue(list.value, hooks.context.SH.value);
    hooks.context.SH.label = hooks.context.SH.select.map((el) => formatterLabel(el));
    hooks.context.SH.index = list.value.reduce(reduceIndex(hooks.context.SH.select), []);
  }

  function updateLabel(val) {
    hooks.context.SH.label = revArray(val);
    hooks.context.SH.select = filterForLabel(list.value, hooks.context.SH.label);
    hooks.context.SH.value = hooks.context.SH.select.map((el) => formatterValue(el));
    hooks.context.SH.index = list.value.reduce(reduceIndex(hooks.context.SH.select), []);
  }

  function updateIndex(val) {
    hooks.context.SH.index = revArray(val);
    hooks.context.SH.select = hooks.context.SH.index.map((el) => list.value?.[el]);
    hooks.context.SH.value = hooks.context.SH.select.map((el) => formatterValue(el));
    hooks.context.SH.label = hooks.context.SH.select.map((el) => formatterLabel(el));
  }
  //  --  //
  function selectOfValue(val) {
    return filterForValue(list.value, val);
  }

  function labelOfValue(val) {
    return selectOfValue(val).map((el) => formatterLabel(el));
  }

  function indexOfValue(val) {
    return list.value.reduce(reduceIndex(selectOfValue(val)), []);
  }
  //  --  //
  function findValueArr() {
    return list.value
      .reduce(reduceItemForValue(hooks.context.SH.select), [])
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

  return hooks;
}

function useAsyncMultiple2(props = {}) {
  const config = {
    watchDataCb({ data, updateList }) {
      updateList(data);
    },
    fetchCb: () => undefined,
    ...props,
  };

  const multipleHook = useMultiple2(config);
  const asyncHooks = config.asyncHooks || usePromise2(config.fetchCb, { ...config });
  let loadingHooks = {};
  if (config.loadingHooks) {
    loadingHooks = useLoading({
      loadingHook: config.loadingHooks,
      promiseHook: asyncHooks,
    });
  }

  const params = useReactive({
    ...multipleHook.getProto(),
    ...asyncHooks.getProto(),
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
