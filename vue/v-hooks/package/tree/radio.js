import { getTreeSelectProps } from "./select";
import { ref, reactive, computed, watch } from "vue";

export class Tree extends Array {
  constructor(options = {}) {
    const config = {
      data: [],
      formatterChildren: (el) => el && el.children,
      ...options,
    };
    const trees = [];
    let gLayer;
    const fun = (childs, parent, layer = -1) => {
      layer++;
      gLayer = layer;
      if (!trees[layer]) trees[layer] = [];
      childs.forEach((el) => {
        trees[layer].push(el);
        el._roote = config.data;
        el._parent = parent;
        el._layer = layer;
        let children = config.formatterChildren(el);
        if (!(children instanceof Array) && children) children = [children];
        if (children && children.length) fun(children, el, el._layer);
      });
    };
    fun(config.data);
    super(...config.data);

    Object.defineProperties(this, {
      layer: {
        value: gLayer ? gLayer + 1 : 0,
      },
      config: {
        // value: config,
        get() {
          return config;
        },
      },
      trees: {
        value: trees,
      },
    });
  }

  findItems(vals, formatter) {
    let current = this;
    const trees = [];
    vals.forEach((el) => {
      if (!current) return;
      const child = current.find((val) => formatter(val) === el);
      if (!child) return;
      trees.push(child);
      current = this.config.formatterChildren(child);
    });
    return trees;
  }

  findItemsForIndex(vals) {
    let current = this;
    const trees = [];
    vals.forEach((el) => {
      if (!current) return;
      const child = current[el];
      if (!child) return;
      trees.push(child);
      current = this.config.formatterChildren(child);
    });
    return trees;
  }

  findIndexs(vals) {
    let current = this;
    const trees = [];
    vals.forEach((el) => {
      if (!current) return;
      const index = current.findIndex((val) => val === el);
      if (!index || index === -1) return;
      trees.push(index);
      current = this.config.formatterChildren(el);
    });
    return trees;
  }

  findItem(formatter) {
    const fun = (list) => {
      for (let index = 0; index < list.length; index++) {
        const element = list[index];
        if (formatter(element)) return element;
        const children = this.config.formatterChildren(element) || [];
        return fun(children);
      }
      return undefined;
    };

    return fun(this);
  }

  recursion(formatter, recursion) {
    const fun = (list) => {
      if (!recursion(list)) return list;
      for (let index = 0; index < list.length; index++) {
        const element = list[index];
        if (!formatter(element)) return element;
        const children = this.config.formatterChildren(element);
        return fun(children);
      }
      return undefined;
    };
    return fun(this);
  }

  findTree(formatter) {
    const trees = [];
    const val = this.findItem(formatter);
    const fun = (item) => {
      if (!item) return;
      trees.push(item);
      if (item._parent) fun(item._parent);
    };
    fun(val);
    trees.reverse();
    return trees.filter(Boolean);
  }

  findTreeByLayer(val) {
    return this.trees[val];
  }

  recursiveFind() {
    //
  }
}

export const useTreeRadio = (options = {}) => {
  const config = getTreeSelectProps(options);
  const { formatterValue, formatterChildren, formatterLabel, formatterDisabled } = config;

  const tree = new Tree({ data: config.list, formatterChildren });

  const list = ref(tree);
  const select = ref([]);
  const value = ref(config.value || []);
  const label = ref(config.label || []);
  const index = ref(config.index || []);

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
    transform,
    transformStore,
    transformParams,
    save,
    restore,
    formatterValue,
    formatterLabel,
    formatterDisabled,
    formatterChildren,

    onSelect,
    same,
    // reset,
    updateList,
    updateValue,
    updateIndex,
    // updateLabel,
    // updateSelect,
    // resolveList, // 废弃
    // resolveValue,
    // verifyValueInList,
    // updateListAndReset,
    // updateListToResolveValue,
    // selectOfValue,
    // labelOfValue,
    // indexOfValue,
  };

  params.proxy = reactive(params);

  let argument = params.proxy;

  function save() {
    store.list = [...params.proxy.list];
    store.select = [...params.proxy.select];
    store.value = [...params.proxy.value];
    store.label = [...params.proxy.label];
    store.index = [...params.proxy.index];
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
    params.proxy.select = [...store.select];
    params.proxy.value = [...store.value];
    params.proxy.label = [...store.label];
    params.proxy.index = [...store.index];
  }

  function onSelect(item, index, layer) {
    if (same(item, index, layer)) return;
    argument.select[layer] = item;
    argument.index[layer] = index;
    argument.label[layer] = formatterLabel(item);
    argument.value[layer] = formatterValue(item);
  }

  function same(item, index, layer) {
    return argument.select[layer] === item;
  }

  function updateValue(val) {
    argument.value = val;
    argument.select = argument.list.findItems(val, formatterValue);
    argument.label = argument.select.map((el) => formatterLabel(el));
    argument.index = argument.list.findIndexs(argument.select);
  }

  function updateIndex(val) {
    argument.index = val;
    argument.select = argument.list.findItemsForIndex(val);
    argument.label = argument.select.map((el) => formatterLabel(el));
    argument.value = argument.select.map((el) => formatterValue(el));
  }

  function updateList(data) {
    argument.list = new Tree({ data, formatterChildren });
    if (argument?.value?.length) argument.updateValue(argument.value);
    if (argument?.index?.length) argument.updateIndex(argument.index);
  }

  return params;
};
