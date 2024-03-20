import { ref, reactive, watch, computed } from "vue";
import { usePromise2, useLoading } from "../promise";
import { getSelectProps } from "./select";
import { useReactive } from "../../other";

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

  let context;
  const initParms = resolveProps(config);
  const list = ref(initParms.list);
  const select = ref(initParms.select);
  const value = ref(initParms.value);
  const label = ref(initParms.label);
  const index = ref(initParms.index);

  const store = reactive({
    list: [],
    select: [],
    value: [],
    label: [],
    index: [],
  });

  const isAllSelect = computed(() => {
    return context.select.length === list.value.length;
  });

  const params = useReactive({
    list,
    select,
    value,
    label,
    index,
    store,
    isMultiple,
    isAllSelect,
    formatterValue,
    formatterLabel,
    formatterDisabled,
    save,
    restore,
    transformStore: changeContextToStore,
    changeContextToStore,
    transformParams: changeContextToProxy,
    changeContextToProxy,
    save_changeContextToStore,
    restore_changeContextToProxy,
    transform,
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
    getContext,
  });

  context = params;

  function getContext() {
    return context;
  }

  function save() {
    store.select = [...params.select];
    store.value = [...params.value];
    store.label = [...params.label];
    store.index = [...params.index];
  }

  function restore() {
    params.select = [...store.select];
    params.value = [...store.value];
    params.label = [...store.label];
    params.index = [...store.index];
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
    return context.select.some((val) => val === item);
  }

  function onSelect(item, i) {
    const val = formatterValue(item);
    const lab = formatterLabel(item);
    if (same(item)) {
      context.select = context.select.filter((v) => v !== item);
      context.value = context.select.map((v) => formatterValue(v));
      context.label = context.select.map((v) => formatterLabel(v));
      context.index = context.index.filter((v) => v !== i);
    } else {
      context.select.push(item);
      context.value.push(val);
      context.label.push(lab);
      context.index.push(i);
    }
  }
  // 反选
  function invertSelect() {
    context.select = list.value.filter((val) => !context.select.some((el) => el === val));
    context.value = context.select.map((el) => formatterValue(el));
    context.label = context.select.map((el) => formatterLabel(el));
    context.index = list.value.reduce(reduceIndex(context.select), []);
  }
  // 全选
  function allSelect() {
    context.select = [...list.value];
    context.value = context.select.map((el) => formatterValue(el));
    context.label = context.select.map((el) => formatterLabel(el));
    context.index = list.value.map((el, nth) => nth);
  }

  function reset() {
    context.select = [];
    context.value = [];
    context.label = [];
    context.index = [];
  }

  function updateList(li, values = {}) {
    list.value = revArray(li);
    const arg = { ...config, list: list.value, ...values };
    const parms = resolveProps(arg);
    context.select = parms.select;
    context.value = parms.value;
    context.label = parms.label;
    context.index = parms.index;
  }

  function updateSelect(val) {
    context.select = revArray(val);
    context.label = context.select.map((el) => formatterLabel(el));
    context.value = context.select.map((el) => formatterValue(el));
    context.index = list.value.reduce(reduceIndex(context.select), []);
  }

  function updateValue(val) {
    context.value = revArray(val);
    context.select = filterForValue(list.value, context.value);
    context.label = context.select.map((el) => formatterLabel(el));
    context.index = list.value.reduce(reduceIndex(context.select), []);
  }

  function updateLabel(val) {
    context.label = revArray(val);
    context.select = filterForLabel(list.value, context.label);
    context.value = context.select.map((el) => formatterValue(el));
    context.index = list.value.reduce(reduceIndex(context.select), []);
  }

  function updateIndex(val) {
    context.index = revArray(val);
    context.select = context.index.map((el) => list.value?.[el]);
    context.value = context.select.map((el) => formatterValue(el));
    context.label = context.select.map((el) => formatterLabel(el));
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
      .reduce(reduceItemForValue(context.select), [])
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
