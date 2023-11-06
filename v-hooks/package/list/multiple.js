import { ref, reactive } from "vue";
import { usePromise } from "../promise";
import { getSelectProps } from "./select";

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

  const store = reactive({
    list: [],
    select: [],
    value: [],
    label: [],
    index: [],
  });

  const params = {
    list,
    select,
    value,
    label,
    index,
    store,
    isMultiple,
    formatterValue,
    formatterLabel,
    formatterDisabled,
    save,
    restore,
    transformStore,
    transformParams,
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
  };

  params.proxy = reactive(params);

  let context = params.proxy;

  function save() {
    store.list = [...params.proxy.list];
    store.select = [...params.proxy.select];
    store.value = [...params.proxy.value];
    store.label = [...params.proxy.label];
    store.index = [...params.proxy.index];
  }

  function restore() {
    params.proxy.list = [...store.list];
    params.proxy.select = [...store.select];
    params.proxy.value = [...store.value];
    params.proxy.label = [...store.label];
    params.proxy.index = [...store.index];
  }

  function transformStore() {
    context = store;
  }

  function transformParams() {
    context = params.proxy;
  }

  function transform() {
    if (context === params.proxy) return (context = store);
    if (context === store) return (context = params.proxy);
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
      context.index = context.value.filter((v) => v !== i);
    } else {
      context.select.push(item);
      context.value.push(val);
      context.label.push(lab);
      context.index.push(i);
    }
  }

  function invertSelect() { // 反选
    context.select = context.list.filter((val) => !context.select.some((el) => el === val));
    context.value = context.select.map((el) => formatterValue(el));
    context.label = context.select.map((el) => formatterLabel(el));
    context.index = context.list.reduce(reduceIndex(context.select), []);
  }

  function allSelect() { // 全选
    context.select = [...context.list];
    context.value = context.select.map((el) => formatterValue(el));
    context.label = context.select.map((el) => formatterLabel(el));
    context.index = context.list.map((el, nth) => nth);
  }

  function reset() {
    context.select = [];
    context.value = [];
    context.label = [];
    context.index = [];
  }

  function updateList(li) {
    context.list = revArray(li);
  }

  function updateSelect(val) {
    context.select = revArray(val);
    context.label = context.select.map((el) => formatterLabel(el));
    context.value = context.select.map((el) => formatterValue(el));
    context.index = context.list.reduce(reduceIndex(context.select), []);
  }

  function updateValue(val) {
    context.value = revArray(val);
    context.select = filterForValue(context.list, context.value);
    context.label = context.select.map((el) => formatterLabel(el));
    context.index = context.list.reduce(reduceIndex(context.select), []);
  }

  function updateLabel(val) {
    context.label = revArray(val);
    context.select = filterForLabel(context.list, context.label);
    context.value = context.select.map((el) => formatterValue(el));
    context.index = context.list.reduce(reduceIndex(context.select), []);
  }

  function updateIndex(val) {
    context.index = revArray(val);
    context.select = context.index.map((el) => context.list?.[el]);
    context.value = context.select.map((el) => formatterValue(el));
    context.label = context.select.map((el) => formatterLabel(el));
  }

  function selectOfValue(val) {
    return filterForValue(context.list, val);
  }

  function labelOfValue(val) {
    return selectOfValue(val).map((el) => formatterLabel(el));
  }

  function indexOfValue(val) {
    return context.list.reduce(reduceIndex(selectOfValue(val)), []);
  }

  function findValueArr() {
    return context.list
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
    context.list = li;
    resolveValue();
  }

  function updateListAndReset(li) {
    updateList(li);
    reset();
  }



  return params;
}

// const arrR = [
//   { label: "label1", value: 1 },
//   { label: "label2", value: 2 },
//   { label: "label3", value: 3 },
//   { label: "label4", value: 4 },
//   { label: "label5", value: 5 },
// ];
// const hook = useMultiple({
//   list: arrR,
//   label: ["label1", "label5"],
// });

function useAsyncMultiple(props = {}) {
  const config = {
    fetchCb: () => undefined,
    ...props,
  };

  const multipleHooks = useMultiple(config);

  const asyncHooks = usePromise(config.fetchCb, {
    then: (data) => {
      multipleHooks.updateListToResolveValue(data);
    },
    ...config,
  });

  const params = { ...multipleHooks, ...asyncHooks };
  params.proxy = reactive(params);
  return params;
}
