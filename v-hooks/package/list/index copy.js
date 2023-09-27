import { ref, reactive, computed, watch } from "vue";
import { usePromise, getPromiseConfig, useInterceptPromiseApply } from "../promise";
import { useSelect } from "./select";

export { getListProps, useList, useLazyList, useListSelect };
export * from "./radio";
export * from "./pagination";

function getListProps(options = {}) {
  const config = {
    ...options,
    afterSetList: () => undefined,
    listStorage: options.list || [],
  };
  return config;
}

function useList(props = {}) {
  const config = getListProps(props);
  let filterFun;

  const listStorage = ref(config.listStorage);
  const list = ref(config.list);

  const arguments_ = {
    listStorage,
    list,
    afterSetList: config.afterSetList,
    updateList,
    reset,
    remove,
    pop,
    shift,
    push,
    unshift,
    filter,
    filterIncludes,
    filterRegExp,
    sort,
    ascendingOrder,
    descendingOrder,
  };
  arguments_.proxy = reactive(arguments_);

  function getList() {
    const list_ = listStorage.value;
    // if( filterFun) list_ = listStorage.value.filter(filterFun);
    return list_;
  }

  function updateList(l) {
    listStorage.value = l;
    list.value = listStorage.value;
    arguments_.afterSetList(arguments_);
  }

  function reset() {
    list.value = listStorage.value;
    arguments_.afterSetList(arguments_);
  }

  /////////////////////////////////////
  /**增加**/
  /////////////////////////////////////
  function push(...args) {
    listStorage.value.push(...args);
    list.value = getList();
    arguments_.afterSetList(arguments_);
  }

  function unshift(...args) {
    listStorage.value.unshift(...args);
    list.value = getList();
    arguments_.afterSetList(arguments_);
  }

  /////////////////////////////////////
  /**删除**/
  /////////////////////////////////////
  function pop() {
    listStorage.value.pop();
    list.value = getList();
    arguments_.afterSetList(arguments_);
  }

  function shift() {
    listStorage.value.shift();
    list.value = getList();
    arguments_.afterSetList(arguments_);
  }

  function remove(...args) {
    const list_ = listStorage.value.filter((el) => !args.includes(el));
    listStorage.value = list_;
    list.value = getList();
    arguments_.afterSetList(arguments_);
  }

  /////////////////////////////////////
  /**修改**/
  /////////////////////////////////////

  /////////////////////////////////////
  /**查找**/
  /////////////////////////////////////
  function filter(fun) {
    filterFun = fun;
    list.value = listStorage.value.filter(fun);
    arguments_.afterSetList(arguments_, 0);
  }

  function filterIncludes(formatter, key, isOr) {
    filterFun = (el, index) => {
      const keyWord = formatter(el) || "";
      const keyWords = keyWord.split(" ").filter(Boolean);
      if (isOr) return keyWords.some((str) => str.includes(key));
      return keyWords.every((str) => str.includes(key));
    };
    list.value = listStorage.value.filter(filterFun);
    arguments_.afterSetList(arguments_, 0);
  }

  function filterRegExp(formatter, regExp) {
    filterFun = (el, index) => {
      const keyWord = formatter(el) || "";
      return regExp.test(keyWord);
    };
    list.value = listStorage.value.filter(filterFun);
    arguments_.afterSetList(arguments_, 0);
  }

  /////////////////////////////////////
  /**排序**/
  /////////////////////////////////////
  function sort(fun) {
    list.value = listStorage.value.sort(fun);
    arguments_.afterSetList(arguments_);
  }

  function ascendingOrder(formatter) {
    list.value = listStorage.value.sort((a, b) => formatter(a) - formatter(b));
    arguments_.afterSetList(arguments_);
  }

  function descendingOrder(formatter) {
    list.value = listStorage.value.sort((a, b) => formatter(b) - formatter(a));
    arguments_.afterSetList(arguments_);
  }

  return arguments_;
}

function getListSelectProps(options = {}) {
  const config = {
    currentPage: 1,
    pageSize: 10,
    ...options,
    listStorage: options.list || [],
  };
  return config;
}

function useListSelect(props = {}) {
  const config = getListSelectProps(props);
  const listHooks = useList(props);

  const selectHooks = useSelect({ ...props, list: listHooks.list.value });

  listHooks.afterSetList = (hooks, type) => {
    // console.log("listHooks.afterSetList", type < 1);
    selectHooks.resolveList(listHooks.list.value);
  };

  const endSlice = ref(config.pageSize);
  function lazyListLoad() {
    endSlice.value += config.pageSize;
  }

  const lazyList = computed(() => {
    return listHooks.list.value.slice(0, endSlice.value);
  });
  const finished = computed(() => endSlice.value >= listHooks.list.value.length);

  const arguments_ = {
    ...selectHooks,
    ...listHooks,
    lazyListLoad,
    lazyList,
    finished,
  };
  arguments_.proxy = reactive(arguments_);
  return arguments_;
}

function useLazyList(props = {}) {
  const config = getListProps(props);
  const listHooks = useList(config);

  const arguments_ = {
    name: "useLazyList",
    listHooks,
    ...listHooks,
  };
  const proxy = reactive(arguments_);
  arguments_.proxy = proxy;
  return arguments_;
}
/**********
 *
 *
 * ******
 *
 *
 *
 *
 *
 * ********
 *
 *
 *
 * *******
 *
 *
 *
 *********/
     

/*
 *
 *
 */
export const getFetchListConfig = (options = {}) => ({
  ...getPromiseConfig(options),
  fetchCB: undefined,
  formatterList({ data }) {
    if (!data) return [];
    if (data instanceof Array) return data;
    return data.list || [];
  },
  ...options,
});
export const useFetchList = (options = {}) => {
  const config = getFetchListConfig(options);
  const hooks = usePromise(config.fetchCB);
  hooks.begin = ref(false);
  hooks.list = ref([]);
  hooks.fetch = async (...arg) => {
    await hooks.run(...arg);
    hooks.list = config.formatterList(hooks);
  };
  return hooks;
};

/*
 * 适用只有一个列表时 多个建议用其他的
 *  currentPage 支持双向数据绑定
 *  pageSize 支持双向数据绑定
 */
export const getPaginationConfig = (options = {}) => {
  const _super = getFetchListConfig(options);
  // 方法不要用this 用 config
  const config = {
    _super: _super,
    ..._super,
    formatterTotal: ({ data }) => {
      if (!data) return 0;
      if (data instanceof Array) return data.length;
      return data.total;
    },
    formatterFinished: ({ total, currentSize }) => {
      return currentSize >= total;
    },
    formatterCurrentPage: ({ currentPage }) => {
      return currentPage + 1;
    },
    serverPaging: false,
    currentPage: 1,
    pageSize: 10,
    total: 0,
    formatterList(hooks) {
      const { currentPage, pageSize, data } = hooks;
      if (!data) return [];
      const isArr = data instanceof Array;
      if (!config.serverPaging) {
        if (!isArr) return [];
        const b = (currentPage - 1) * pageSize;
        const e = currentPage * pageSize;
        return data.slice(b, e);
      }
      return _super.formatterList(hooks);
    },
    ...options,
  };
  return config;
};
export const usePaginationList = (options = {}) => {
  const config = getPaginationConfig(options);

  const hooks = useFetchList(config);
  hooks.list = ref([]);
  hooks.currentPage = ref(config.currentPage);
  hooks.pageSize = ref(config.pageSize);
  hooks.total = ref(config.total);
  hooks.finished = ref(false);
  hooks._currentPage = ref(config.currentPage);

  watch(
    () => hooks.currentPage,
    (val) => {
      hooks._currentPage = val;
      console.log("watch", hooks._currentPage);
    }
  );

  hooks.currentSize = computed(() => hooks.currentPage * hooks.pageSize);

  const resolve = (accumulation = true) => {
    let list = config.formatterList(hooks);
    if (accumulation) list = hooks.list.concat(list);
    hooks.list = list;
    hooks.total = config.formatterTotal(hooks);
    hooks.finished = config.formatterFinished(hooks);
    hooks.begin = false;

    if (!hooks.finished) {
      hooks._currentPage = config.formatterCurrentPage(hooks);
    }
  };

  const fetch = async (accumulation = true, ...arg) => {
    const res = await hooks.run(...arg);
    resolve(accumulation);
    return res;
  };

  const serverConcat = async (...arg) => {
    hooks.currentPage = hooks._currentPage;
    return fetch(true, ...arg);
  };

  const concat = async (...arg) => {
    if (hooks.finished) return console.error("没有更多的了");
    if (config.serverPaging) return serverConcat(...arg);
    hooks.currentPage = hooks.currentPage + 1;
    resolve(true);
  };

  const replace = async (...arg) => {
    if (config.serverPaging) return fetch(false, ...arg);
    resolve(false);
  };

  const reset = async (...arg) => {
    hooks.currentPage = config.currentPage;
    hooks.finished = false;
    hooks.total = config.total;
    return fetch(false, ...arg);
  };

  const beginning = async (...arg) => {
    hooks.begin = true;
    hooks.list = [];
    await reset(...arg);
  };

  hooks["onUpdate:current-page"] = (v) => (hooks.currentPage = v);
  hooks["onUpdate:page-size"] = (v) => (hooks.pageSize = v);
  hooks.resolve = resolve;
  hooks.beginning = beginning;
  hooks.concat = concat;
  hooks.replace = replace;
  hooks.reset = reset;
  hooks.fetch = fetch;

  return hooks;
};

export const useTablePagination = (options = {}) => {
  const hooks = usePaginationList(options);
  hooks.onPageChange = (currentPage, pageSize) => {
    hooks.currentPage = currentPage;
    hooks.pageSize = pageSize;
    hooks.replace();
  };
  return hooks;
};

export const useFetchApplyList = (options = {}) => {
  //
};
