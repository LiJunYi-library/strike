import { ref, reactive, computed, watch } from "vue";
import { usePromise, getPromiseConfig, useInterceptPromiseApply } from "../promise";

export * from "./radio";
export * from "./radio2";
export * from "./radio3";
export * from "./multiple";
export * from "./multiple2";
export * from "./select";
export * from "./select2";

export * from "./list";
export * from "./listLoad";
export * from "./pagination2";
export * from "./pagination";
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
