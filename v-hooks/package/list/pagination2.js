import { ref, reactive, computed, watch } from "vue";
import { usePromise2, nextTaskHoc } from "../promise";
import { useSelect2 } from "./select2";
import { useReactive } from "../../other";

export { useFetchPagination2 };

function getPaginationProps(options = {}) {
  const config = {
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
  const total = computed(() => listSource.value.length);
  const maxPage = computed(() => Math.ceil(total.value / pageSize.value) || 1);

  const params = useReactive({
    listSource,
    currentPage,
    pageSize,
    list,
    total,
    updateCurrentPage,
    updatePageSize,
    updateList,
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

  function updateList(l) {
    listSource.value = l;
    if (currentPage.value > maxPage.value) currentPage.value = maxPage.value;
    list.value = paging(params);
  }

  function reset() {
    currentPage.value = 1;
    list.value = paging(params);
  }

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

  const selectHooks = config.selectHooks || useSelect2({ ...config });
  const asyncHooks = config.asyncHooks || usePromise2(config.fetchCb, { ...config });
  const paginationHooks = usePagination(config);

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
    currentPage,
    pageSize,
    prop,
    order,
    list,
    total,
    nextBeginSend,
    nextSend,
    updatePage,
    updatePageSize,
    updateProp,
    updateOrder,
  });

  function handleServerPagingRest() {
    if (!config.isServerPaging) {
      paginationHooks.updateList(config.formatterList(params));
      total.value = paginationHooks.total;
      list.value = paginationHooks.list;
      selectHooks.updateListAndReset(list.value);
      return;
    }
    total.value = config.formatterTotal(params);
    list.value = config.formatterList(params);
    selectHooks.updateListAndReset(list.value);
  }

  function handleServerPaging() {
    if (!config.isServerPaging) {
      paginationHooks.updatePageSize(pageSize.value);
      paginationHooks.updateCurrentPage(currentPage.value);
      list.value = paginationHooks.list;
      selectHooks.updateListAndReset(list.value);
      return false;
    }
    return true;
  }

  function nextBeginSend(...arg) {
    currentPage.value = config.currentPage;
    pageSize.value = config.pageSize;
    total.value = config.total;
    list.value = config.list;
    return asyncHooks.nextBeginSend(...arg).then((res) => {
      handleServerPagingRest();
      return res;
    });
  }

  function nextSend(...arg) {
    return asyncHooks.nextSend(...arg).then((res) => {
      handleServerPagingRest();
      return res;
    });
  }

  async function serverPaging() {
    if (!handleServerPaging()) return;
    await mergeEvent();
    return nextSend();
  }

  async function serverBeginPaging() {
    if (!config.isServerPaging) return;
    await mergeEvent();
    return nextBeginSend();
  }

  async function updatePage(p) {
    currentPage.value = p;
    return serverPaging();
  }

  async function updatePageSize(size) {
    pageSize.value = size;
    return serverPaging();
  }

  async function updateProp(p) {
    prop.value = p;
    return serverBeginPaging();
  }

  async function updateOrder(o) {
    order.value = o;
    return serverBeginPaging();
  }

  return params;
}
