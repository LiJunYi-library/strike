import { ref, computed, watch } from "vue";
import { usePromise2, useLoading } from "../promise";
import { nextTaskHoc } from "../abandon/async";
import { useSelect2 } from "./select2";
import { useReactive } from "../../other";
import { useListSelect, useList } from "./list";

export { useFetchPagination2, usePaginationList, useSelectPagination };

function getPaginationProps(options = {}) {
  const config = {
    triggerFetch: true,
    isServerPaging: true,
    currentPage: 1,
    pageSize: 10,
    total: 0,
    prop: undefined,
    order: undefined,
    fetchCb: () => undefined,
    formatterList(hooks) {
      const { data } = hooks;
      if (!data) return [];
      if (data instanceof Array) return data;
      return data.list || [];
    },
    formatterTotal: (hooks) => {
      const { data } = hooks;
      if (!data) return 0;
      if (data instanceof Array) return data.length;
      return data.total * 1;
    },
    ...options,
    list: options.list || [],
  };

  return config;
}

// 静态分页
function usePagination(props = {}) {
  const config = getPaginationProps(props);

  function paging(options = config) {
    const { currentPage, pageSize, listSource } = options;
    const isArr = listSource instanceof Array;
    if (!isArr) return [];
    const b = (currentPage - 1) * pageSize;
    const e = currentPage * pageSize;
    return listSource.slice(b, e);
  }

  function resolveProps(options = config) {
    const arg = {
      listSource: options.listSource,
      currentPage: options.currentPage,
      pageSize: options.pageSize,
      list: paging(options),
    };
    return arg;
  }

  const initProps = resolveProps({ ...config, listSource: config.list });
  const listSource = ref(initProps.listSource);
  const currentPage = ref(initProps.currentPage);
  const pageSize = ref(initProps.pageSize);
  const list = ref(initProps.list);
  const total = ref(listSource.value.length);
  const maxPage = computed(() => Math.ceil(total.value / pageSize.value) || 1);

  const params = useReactive({
    listSource,
    currentPage,
    pageSize,
    list,
    total,
    maxPage,
    updatePage: updateCurrentPage,
    updateCurrentPage,
    updatePageSize,
    updateList,
    updateTotal,
    reset,
  });

  function updateCurrentPage(p) {
    currentPage.value = p;
    list.value = paging(params);
  }

  function updatePageSize(size) {
    pageSize.value = size;
    if (currentPage.value > maxPage.value) currentPage.value = maxPage.value;
    list.value = paging(params);
  }

  function updateList(l = []) {
    listSource.value = l;
    total.value = listSource.value.length;
    if (currentPage.value > maxPage.value) currentPage.value = maxPage.value;
    list.value = paging(params);
  }

  function updateTotal(t = 0) {
    total.value = t;
    if (currentPage.value > maxPage.value) currentPage.value = maxPage.value;
    list.value = paging(params);
  }

  function reset() {
    currentPage.value = 1;
    list.value = paging(params);
  }

  return params;
}

// 静态分页 远程获取数据 可选择 不是远程分页
function useSelectPagination(props = {}) {
  const config = {
    ...getPaginationProps(props),
    watchListChange: (params, selectHooks, paginationHooks) => {
      selectHooks.updateListAndReset(paginationHooks.list);
    },
    watchDataChange(params, selectHooks, paginationHooks) {
      paginationHooks.updateList(config.formatterList(params));
    },
  };

  const paginationHooks = usePagination({ ...config });
  const asyncHooks = config.asyncHooks || usePromise2(config.fetchCb, { ...config });
  const selectHooks = config.selectHooks || useSelect2({ ...config });

  const params = useReactive({
    ...selectHooks.getProto(),
    ...asyncHooks.getProto(),
    ...paginationHooks.getProto(),
    nextBeginSend,
    beginSend,
  });

  watch(
    () => paginationHooks.list,
    () => config.watchListChange(params, selectHooks, paginationHooks),
  );

  watch(
    () => asyncHooks.data,
    () => config.watchDataChange(params, selectHooks, paginationHooks),
  );

  function nextBeginSend(...arg) {
    paginationHooks.reset();
    return asyncHooks.nextBeginSend(...arg);
  }

  function beginSend(...arg) {
    paginationHooks.reset();
    return asyncHooks.beginSend(...arg);
  }

  return params;
}

//远程获取数据  分页 可选择 增删改查
function usePaginationList(props = {}) {
  const config = {
    ...getPaginationProps(props),
    watchDataChange(params, listHooks, paginationHooks, selectHooks) {
      listHooks.updateList(config.formatterList(params));
    },
    watchListChange: (params, listHooks, paginationHooks, selectHooks) => {
      paginationHooks.updateList(listHooks.list);
    },
    watchPaginationChange(params, listHooks, paginationHooks, selectHooks) {
      selectHooks.updateListToResolveValue(paginationHooks.list);
    },
  };

  const paginationHooks = usePagination({ ...config });
  const asyncHooks = config.asyncHooks || usePromise2(config.fetchCb, { ...config });
  const listHooks = useList({ ...config });
  const selectHooks = config.selectHooks || useSelect2({ ...config });

  const params = useReactive({
    ...asyncHooks.getProto(),
    ...selectHooks.getProto(),
    ...listHooks.getProto(),
    ...paginationHooks.getProto(),
  });

  watch(
    () => asyncHooks.data,
    () => config.watchDataChange(params, listHooks, paginationHooks, selectHooks),
  );

  watch(
    () => listHooks.list,
    () => config.watchListChange(params, listHooks, paginationHooks, selectHooks),
  );

  watch(
    () => paginationHooks.list,
    () => config.watchPaginationChange(params, listHooks, paginationHooks, selectHooks),
  );

  return params;
}

// 远程分页
function useFetchPagination2(props = {}) {
  const config = getPaginationProps(props);

  const currentPage = ref(config.currentPage);
  const pageSize = ref(config.pageSize);
  const list = ref(config.list);
  const total = ref(config.total);
  const prop = ref(config.prop);
  const order = ref(config.order);
  const maxPage = computed(() => Math.ceil(total.value / pageSize.value) || 1);

  const selectHooks = config.selectHooks || useSelect2({ ...config });
  const asyncHooks = config.asyncHooks || usePromise2(config.fetchCb, { ...config });

  let loadingHooks = {};
  if (config.loadingHooks) {
    loadingHooks = useLoading({
      loadingHook: config.loadingHooks,
      promiseHook: asyncHooks,
    });
  }

  const time0 = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 0);
    });
  };

  const mergeEvent = nextTaskHoc()(time0);

  const params = useReactive({
    ...selectHooks.getProto(),
    ...asyncHooks.getProto(),
    ...loadingHooks?.getProto?.(),
    currentPage,
    pageSize,
    prop,
    order,
    list,
    total,
    maxPage,
    nextBeginSend,
    nextSend,
    updateCurrentPage,
    updatePage: updateCurrentPage,
    updatePageSize,
    updateProp,
    updateOrder,
    reset,
  });

  function nextBeginSend(...arg) {
    currentPage.value = config.currentPage;
    pageSize.value = config.pageSize;
    total.value = config.total;
    list.value = config.list;
    return asyncHooks.nextBeginSend(...arg).then((res) => {
      onResponse();
      return res;
    });
  }

  function nextSend(...arg) {
    return asyncHooks.nextSend(...arg).then((res) => {
      onResponse();
      return res;
    });
  }

  function onResponse() {
    total.value = config.formatterTotal(params);
    list.value = config.formatterList(params);
    if (currentPage.value > maxPage.value) currentPage.value = maxPage.value;
    selectHooks.updateListAndReset(list.value);
  }

  function reset() {
    currentPage.value = 1;
    pageSize.value = config.pageSize;
    total.value = 0;
    list.value = [];
    selectHooks.reset(list.value);
  }

  async function updateCurrentPage(p) {
    currentPage.value = p;
    await mergeEvent();
    if (config.triggerFetch) return nextSend();
  }

  async function updatePageSize(size) {
    pageSize.value = size;

    if (currentPage.value > maxPage.value) currentPage.value = maxPage.value;
    await mergeEvent();
    if (config.triggerFetch) return nextSend();
  }

  async function updateProp(p) {
    prop.value = p;
    await mergeEvent();
    if (config.triggerFetch) return nextBeginSend();
  }

  async function updateOrder(o) {
    order.value = o;
    await mergeEvent();
    if (config.triggerFetch) return nextBeginSend();
  }

  return params;
}
