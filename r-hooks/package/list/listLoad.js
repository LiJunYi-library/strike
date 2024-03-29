import { ref, useProxy, refs, onCreat } from "../utils/ref";
import { computeLoading } from "../promise";
import { mergeHooks } from "../utils";

export { useListLoad, getListLoadProps };

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
    total: 0,
    finished: false,
    listData: [],
    accumulationList: true,
    isBeginSendResetList: true,
    dataMethodListeners: [],
    loadingMethodListeners: [],
    ...options,
    list: options.list || [], // 默认列表的数据
  };
  return config;
}

function useListLoad(props = {}) {
  const config = getListLoadProps(props);

  const list = ref(config.list);
  const currentPage = ref(config.currentPage);
  const pageSize = ref(config.pageSize);
  const total = ref(config.total);
  const finished = ref(config.finished);
  const listData = ref(config.listData);

  const loadingHooks = computeLoading({
    promiseHooks: config.asyncHooks,
    loadingHooks: config.loadingHooks,
  });

  const hooks = onCreat(() => {
    const asyncs = mergeHooks(config.asyncHooks, loadingHooks);
    const params = useProxy({
      ...asyncs,
      list,
      listData,
      currentPage,
      pageSize,
      finished,
      total,
      memos: refs(list, listData, currentPage, pageSize, finished, total, ...asyncs.memos),
      nextBeginSend,
      awaitConcatSend,
      reset,
    });

    function reset() {
      list.value = [];
      listData.value = [];
      currentPage.value = 1;
      finished.value = false;
      total.value = 0;
    }

    function nextBeginSend(...arg) {
      if (config.isBeginSendResetList) list.value = [];
      listData.value = [];
      currentPage.value = 1;
      finished.value = false;
      total.value = 0;
      config.beforeBegin(params);
      return config.asyncHooks.nextBeginSend(...arg).then((res) => {
        listData.value = config.setList(res, params) || [];
        list.value = listData.value;
        currentPage.value = config.setCurrentPage(res, params);
        total.value = config.setTotal(res, params);
        finished.value = config.setFinished(res, params);
        config.fetchBeginCB(params);
        if (listData.value.length === 0) return res;
        if (list.value.length < pageSize.value) {
          return awaitConcatSend(...arg);
        }
        return res;
      });
    }

    function awaitConcatSend(...arg) {
      if (finished.value === true) return;
      return config.asyncHooks.awaitSend(...arg).then((res) => {
        listData.value = config.setList(res, params) || [];
        list.value.push(...listData.value);
        currentPage.value = config.setCurrentPage(res, params);
        total.value = config.setTotal(res, params);
        finished.value = config.setFinished(res, params);
        config.fetchConcatCB(params);
        if (listData.value.length === 0) return res;
        if (list.value.length < pageSize.value) {
          return awaitConcatSend(...arg);
        }
        return res;
      });
    }

    return params;
  });

  return hooks;
}
