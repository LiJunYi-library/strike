import { ref, reactive, computed, watch } from "vue";
import { usePromise2, useLoading } from "../promise";
import { useReactive } from "../../other";
import { useSelect2 } from "./select2";

export { getListProps, useList, useAsyncList, useListSelect, useAsyncListSelect };

function getListProps(options = {}) {
  const config = {
    ...options,
    list: options.list || [],
    listStorage: options.list || [],
  };
  return config;
}

function useList(props = {}) {
  const config = getListProps(props);

  const listStorage = ref([...config.list]);
  const list = ref(config.list);
  const sortFun = ref();
  const filterFun = ref();

  const params = useReactive({
    filterFun,
    sortFun,
    //
    listStorage,
    list,
    //
    updateList,
    //
    clearSort,
    clearFilter,
    reset,
    //
    push,
    unshift,
    splice,
    //
    remove,
    pop,
    shift,
    //
    filter,
    //
    sort,
    ascendingOrder,
    descendingOrder,
  });

  function getList() {
    let list_ = [...listStorage.value];
    if (filterFun.value) list_ = list_.filter(filterFun.value);
    if (sortFun.value) list_ = list_.sort(sortFun.value);
    return list_;
  }

  function updateList(l) {
    listStorage.value = l;
    list.value = getList();
  }

  function reset() {
    list.value = [...listStorage.value];
    sortFun.value = null;
    filterFun.value = null;
  }

  function clearSort() {
    sortFun.value = null;
    list.value = getList();
  }

  function clearFilter() {
    filterFun.value = null;
    list.value = getList();
  }

  /**增加**/ /////////////////////////////////////
  function push(...args) {
    listStorage.value.push(...args);
    list.value = getList();
  }

  function unshift(...args) {
    listStorage.value.unshift(...args);
    list.value = getList();
  }

  function splice(...args) {
    listStorage.value.splice(...args);
    list.value = getList();
  }
  /////////////////////////////////////

  /**删除**/ /////////////////////////////////////
  function pop() {
    const item = list.value.at(-1);
    remove(item);
  }

  function shift() {
    const item = list.value[0];
    remove(item);
  }

  function remove(...args) {
    listStorage.value = listStorage.value.filter((el) => !args.includes(el));
    list.value = list.value.filter((el) => !args.includes(el));
  }
  /////////////////////////////////////

  /**修改**/ /////////////////////////////////////
  /////////////////////////////////////

  /**查找**/ /////////////////////////////////////
  function filter(fun) {
    filterFun.value = fun;
    list.value = listStorage.value.filter(fun);
    if (sortFun.value) list.value.sort(sortFun.value);
  }
  /////////////////////////////////////

  /**排序**/ /////////////////////////////////////
  function sort(fun) {
    sortFun.value = fun;
    list.value.sort(fun);
  }

  function ascendingOrder(formatter) {
    sortFun.value = (a, b) => formatter(a) - formatter(b);
    list.value.sort(sortFun.value);
  }

  function descendingOrder(formatter) {
    sortFun.value = (a, b) => formatter(b) - formatter(a);
    list.value.sort(sortFun.value);
  }

  return params;
}

function useAsyncList(props = {}) {
  const config = {
    watchDataCb: ({ data, updateList }) => {
      updateList(data);
    },
    fetchCb: () => undefined,
    ...props,
  };
  const listHooks = useList(config);
  const asyncHooks = config.asyncHooks || usePromise2(config.fetchCb, { ...config });
  let loadingHooks = {};
  if (config.loadingHooks) {
    loadingHooks = useLoading({
      loadingHook: config.loadingHooks,
      promiseHook: asyncHooks,
    });
  }

  const params = useReactive({
    ...listHooks.getProto(),
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

function useListSelect(props = {}) {
  const config = {
    useListWatchList: (data, selectHooks, listHooks) => {
      selectHooks.updateListToResolveValue(data);
    },
    ...props,
  };
  const listHooks = useList(props);
  const selectHooks = useSelect2({ ...props, list: listHooks.list });

  const params = useReactive({
    ...selectHooks.getProto(),
    ...listHooks.getProto(),
  });

  watch(
    () => listHooks.list,
    (data) => {
      config.useListWatchList(data, selectHooks, listHooks);
    }
  );

  return params;
}

function useAsyncListSelect(props = {}) {
  const config = {
    watchDataCb: ({ data, updateList }) => {
      updateList(data);
    },
    fetchCb: () => undefined,
    ...props,
  };
  const listHooks = useListSelect(props);
  const asyncHooks = config.asyncHooks || usePromise2(config.fetchCb, { ...config });
  let loadingHooks = {};
  if (config.loadingHooks) {
    loadingHooks = useLoading({
      loadingHook: config.loadingHooks,
      promiseHook: asyncHooks,
    });
  }

  const params = useReactive({
    ...listHooks.getProto(),
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
