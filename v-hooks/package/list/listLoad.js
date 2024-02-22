import { ref, reactive, watch } from "vue";
import { usePromise, usePromise2 } from "../promise";
import { useProxy, useReactive } from "../../other";
import { useSelect2 } from "./select2";

export { useListLoad, getListLoadProps, useAsyncListLoad, useListLoad2, useListLoadSelect };

function getListLoadProps(options) {
  const config = {
    setList: (res) => {
      // 设置数据的回调 返回[]
      if (!res) return [];
      if (res instanceof Array) return res;
      return res.list || [];
    },
    setTotal: (res) => {
      // 设置总数的回调 返回数字
      if (!res) return 0;
      if (res instanceof Array) return res.length;
      return res.total * 1;
    },
    setFinished: (res, hooks) => {
      // 设置结束状态的回调 返回Boolean
      return hooks.list.length >= hooks.total;
    },
    setCurrentPage: (res, hooks) => {
      return hooks.currentPage + 1;
    },
    fetchCB: () => undefined, // 异步的回调 返回异步数据
    fetchBeginCB: () => undefined,
    fetchConcatCB: () => undefined,
    beforeBegin: () => undefined,
    currentPage: 1, // 当前的页码
    pageSize: 10, // 请求的页数
    accumulationList: true,
    dataMethodListeners: [],
    loadingMethodListeners: [],
    ...options,
    list: options.list || [], // 默认列表的数据
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
      currentPage.value = config.setCurrentPage(res, arguments_.proxy);
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
      currentPage.value = config.setCurrentPage(res, arguments_.proxy);
      total.value = config.setTotal(res, proxy);
      finished.value = config.setFinished(res, proxy);
      config.fetchConcatCB(proxy);
    });
  }

  return arguments_;
}

function useAsyncListLoad(props = {}) {
  const config = getListLoadProps(props);
  const asyncHooks = config.asyncHooks || usePromise(config.fetchCb, { ...config });

  const list = ref(config.list);
  const currentPage = ref(config.currentPage);
  const pageSize = ref(config.pageSize);
  const total = ref(0);
  const finished = ref(false);
  const listData = ref([]);

  const params = useProxy({
    ...asyncHooks,
    list,
    listData,
    currentPage,
    pageSize,
    finished,
    total,
    nextBeginSend,
    awaitConcatSend,
  });

  function nextBeginSend(...arg) {
    list.value = [];
    listData.value = [];
    currentPage.value = 1;
    finished.value = false;
    total.value = 0;
    config.beforeBegin(params.proxy);
    return asyncHooks.nextBeginSend(...arg).then((res) => {
      listData.value = config.setList(res, params.proxy);
      list.value = listData.value;
      currentPage.value = config.setCurrentPage(res, params.proxy);
      total.value = config.setTotal(res, params.proxy);
      finished.value = config.setFinished(res, params.proxy);
      config.fetchBeginCB(params.proxy);
    });
  }

  function awaitConcatSend(...arg) {
    if (finished.value === true) return;
    if (asyncHooks.loading.value === true) return;
    return asyncHooks.awaitSend(...arg).then((res) => {
      listData.value = config.setList(res, params.proxy);
      list.value = list.value.concat(listData.value);
      currentPage.value = config.setCurrentPage(res, params.proxy);
      total.value = config.setTotal(res, params.proxy);
      finished.value = config.setFinished(res, params.proxy);
      config.fetchConcatCB(params.proxy);
    });
  }

  return params;
}

function useListLoad2(props = {}) {
  const config = getListLoadProps(props);
  const asyncHooks = config.asyncHooks || usePromise2(config.fetchCb, { ...config });

  const list = ref(config.list);
  const currentPage = ref(config.currentPage);
  const pageSize = ref(config.pageSize);
  const total = ref(0);
  const finished = ref(false);
  const listData = ref([]);

  const params = useReactive({
    ...asyncHooks.getProto(),
    list,
    listData,
    currentPage,
    pageSize,
    finished,
    total,
    nextBeginSend,
    awaitConcatSend,
  });

  function nextBeginSend(...arg) {
    list.value = [];
    listData.value = [];
    currentPage.value = 1;
    finished.value = false;
    total.value = 0;
    config.beforeBegin(params);
    return asyncHooks.nextBeginSend(...arg).then((res) => {
      listData.value = config.setList(res, params);
      list.value = listData.value;
      currentPage.value = config.setCurrentPage(res, params);
      total.value = config.setTotal(res, params);
      finished.value = config.setFinished(res, params);
      config.fetchBeginCB(params);
      return res;
    });
  }

  function awaitConcatSend(...arg) {
    return asyncHooks.awaitSend(...arg).then((res) => {
      listData.value = config.setList(res, params);
      list.value = list.value.concat(listData.value);
      currentPage.value = config.setCurrentPage(res, params);
      total.value = config.setTotal(res, params);
      finished.value = config.setFinished(res, params);
      config.fetchConcatCB(params);
      return res;
    });
  }

  return params;
}

function useListLoadSelect(props = {}) {
  const config = {
    useListWatchList: (data, selectHooks, listLoadHooks) => {
      selectHooks.updateListToResolveValue(data);
    },
    ...props,
  };
  const listLoadHooks = useListLoad2(props);
  const selectHooks = useSelect2({ ...props, list: listLoadHooks.list });

  const params = useReactive({
    ...selectHooks.getProto(),
    ...listLoadHooks.getProto(),
  });

  watch(
    () => listLoadHooks.list,
    (data) => {
      config.useListWatchList(data, selectHooks, listLoadHooks);
    }
  );
  return params;
}
