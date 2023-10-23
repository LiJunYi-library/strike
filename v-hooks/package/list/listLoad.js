import { ref, reactive, computed } from "vue";
import { usePromise } from "../promise";

export { useListLoad, getListLoadProps };

function getListLoadProps(options) {
  const config = {
    setList: (res) => {
      if (!res) return [];
      if (res instanceof Array) return res;
      return res.list || [];
    },
    setTotal: (res) => {
      if (!res) return 0;
      if (res instanceof Array) return res.length;
      return res.total * 1;
    },
    setFinished: (res, hooks) => {
      return hooks.list.length >= hooks.total;
    },
    fetchCB: () => undefined,
    fetchBeginCB: () => undefined,
    fetchConcatCB: () => undefined,
    beforeBegin: () => undefined,
    currentPage: 1,
    pageSize: 10,
    accumulationList: true,
    dataMethodListeners: [],
    loadingMethodListeners: [],
    ...options,
    list: options.list || [],
  };
  return config;
}

function useListLoad(props = {}) {
  const config = getListLoadProps(props);
  const asyncHooks = usePromise(config.fetchCb, { ...config });

  const list = ref(config.list);
  const currentPage = ref(config.currentPage);
  const pageSize = ref(config.pageSize);
  const total = ref(0);
  const finished = ref(false);
  const listData = ref([]);

  const arguments_ = {
    ...asyncHooks,
    list,
    listData,
    currentPage,
    pageSize,
    finished,
    total,
    fetchBegin,
    fetchConcat,
  };
  const proxy = reactive(arguments_);
  arguments_.proxy = proxy;

  function fetchBegin(...arg) {
    list.value = [];
    listData.value = [];
    currentPage.value = 1;
    finished.value = false;
    total.value = 0;
    config.beforeBegin(proxy);
    return asyncHooks.runBegin(...arg).then((res) => {
      listData.value = config.setList(res, proxy);
      list.value = listData.value;
      currentPage.value = currentPage.value + 1;
      total.value = config.setTotal(res, proxy);
      finished.value = config.setFinished(res, proxy);
      config.fetchBeginCB(proxy);
    });
  }

  function fetchConcat(...arg) {
    if (finished.value === true) {
      return;
    }
    if (asyncHooks.loading.value === true) {
      return;
    }
    return asyncHooks.run(...arg).then((res) => {
      listData.value = config.setList(res, proxy);
      list.value = list.value.concat(listData.value);
      currentPage.value = currentPage.value + 1;
      total.value = config.setTotal(res, proxy);
      finished.value = config.setFinished(res, proxy);
      config.fetchConcatCB(proxy);
    });
  }
  return arguments_;
}
