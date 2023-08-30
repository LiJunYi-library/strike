import { ref, reactive, computed, watch } from "vue";
import { usePromise, nextTaskHoc } from "../promise";
import { useMultiple } from "./multiple";
import { useSelect } from "./select";
import { useList } from "./list";

export {
  getPaginationProps,
  usePagination,
  usePaginationSelect,
  useListPagination,
  useAsyncPagination,
  useAsyncPaginationSelect,
  useAsyncListPagination,
  useFetchPagination,
};

function getPaginationProps(options = {}) {
  const config = {
    serverPaging: true,
    currentPage: 1,
    pageSize: 10,
    total: 0,
    fetchCb: () => undefined,
    formatterList(hooks) {
      const { data } = hooks;
      console.log(data);
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
    listSource: options.list || [],
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
  const initProps = resolveProps(config);

  const listSource = ref(initProps.listSource);
  const currentPage = ref(initProps.currentPage);
  const pageSize = ref(initProps.pageSize);
  const list = ref(initProps.list);
  const total = computed(() => listSource.value.length);

  const finished = computed(() => list.value.length >= total.value);
  const currentSize = computed(() => list.value.length);
  const maxPage = computed(() => Math.ceil(total.value / pageSize.value) || 1);
  const paginationNextDisabled = computed(() => currentPage.value >= maxPage.value);
  const paginationPrevDisabled = computed(() => currentPage.value <= 1);

  const params = {
    maxPage,
    listSource,
    list,
    currentPage,
    pageSize,
    total,
    finished,
    currentSize,
    paginationNextDisabled,
    paginationPrevDisabled,
    afterSetList: config.afterSetList,
    paging,
    paginationConcat,
    paginationNext,
    paginationPrev,
    updatePage,
    updatePageSize,
    updatePagination,

    reset,
    updateList,
    updateListAndReset,
  };
  const proxy = reactive(params);
  params.proxy = proxy;

  function updatePage(p) {
    currentPage.value = p;
    const arr = paging(proxy);
    list.value = arr;
    params?.afterSetList?.(params);
  }

  function updatePageSize(size) {
    pageSize.value = size;
    if (currentPage.value > maxPage.value) currentPage.value = maxPage.value;
    list.value = paging(proxy);
    params?.afterSetList?.(params);
  }

  function updatePagination(page, size) {
    currentPage.value = page;
    pageSize.value = size;
    const arr = paging(proxy);
    list.value = arr;
    params?.afterSetList?.(params);
  }

  function paginationConcat() {
    if (finished.value) return;
    currentPage.value++;
    const arr = paging(proxy);
    list.value = list.value.concat(arr);
    params?.afterSetList?.(params);
  }

  function paginationNext() {
    if (paginationNextDisabled.value) return;
    currentPage.value++;
    const arr = paging(proxy);
    list.value = arr;
    params?.afterSetList?.(params);
  }

  function paginationPrev() {
    if (paginationPrevDisabled.value) return;
    currentPage.value--;
    const arr = paging(proxy);
    list.value = arr;
    params?.afterSetList?.(params);
  }
  /****/
  function reset() {
    currentPage.value = 1;
    pageSize.value = config.pageSize;
    list.value = paging(proxy);
    params?.afterSetList?.(params);
  }

  function updateList(l) {
    listSource.value = l;
    if (currentPage.value > maxPage.value) currentPage.value = maxPage.value;
    list.value = paging(proxy);
    params?.afterSetList?.(params);
  }

  function updateListAndReset(l) {
    listSource.value = l;
    reset();
  }

  return params;
}

function useAsyncPagination(props = {}) {
  const config = { fetchCb: () => undefined, ...props };

  const pagination = usePagination(config);

  const asyncHooks = usePromise(config.fetchCb, {
    then: (data) => {
      pagination.updateList(data);
    },
    ...config,
  });

  const params = { ...pagination, ...asyncHooks };
  params.proxy = reactive(params);
  return params;
}

function usePaginationSelect(props = {}) {
  // eslint-disable-next-line
  var selectHooks;

  const paginationHooks = usePagination({
    afterSetList: () => {
      selectHooks.updateListToResolveValue(paginationHooks.list.value);
    },
    ...props,
  });

  selectHooks = useSelect({ ...props, list: paginationHooks.list.value });

  const params = {
    ...selectHooks,
    ...paginationHooks,
  };

  params.proxy = reactive(params);

  return params;
}

function useAsyncPaginationSelect(props = {}) {
  const config = { fetchCb: () => undefined, ...props };

  const paginationSelect = usePaginationSelect(config);

  const asyncHooks = usePromise(config.fetchCb, {
    then: (data) => {
      paginationSelect.updateList(data);
    },
    ...config,
  });

  const params = { ...paginationSelect, ...asyncHooks };
  params.proxy = reactive(params);
  return params;
}

function useListPagination(props = {}) {
  // eslint-disable-next-line
  var listHooks, paginationHooks, selectHooks;

  listHooks = useList({
    ...props,
    afterSetList: () => {
      paginationHooks.updateList(listHooks.list.value);
    },
  });

  paginationHooks = usePagination({
    ...props,
    listSource: listHooks.list.value,
    afterSetList: () => {
      selectHooks.updateListToResolveValue(paginationHooks.list.value);
    },
  });

  selectHooks = useSelect({ ...props, list: paginationHooks.list.value });

  const params = {
    ...selectHooks,
    ...paginationHooks,
    ...listHooks,
    list: paginationHooks.list,
  };
  params.proxy = reactive(params);
  return params;
}

function useAsyncListPagination(props = {}) {
  const config = { fetchCb: () => undefined, ...props };

  const listPaginationooks = useListPagination(config);

  const asyncHooks = usePromise(config.fetchCb, {
    then: (data) => {
      listPaginationooks.updateList(data);
    },
    ...config,
  });

  const params = { ...listPaginationooks, ...asyncHooks };
  params.proxy = reactive(params);
  return params;
}

function useFetchPagination(props = {}) {
  const config = getPaginationProps(props);

  const currentPage = ref(config.currentPage);
  const pageSize = ref(config.pageSize);
  const list = ref(config.list);
  const total = ref(config.total);

  const selectHooks = useSelect({ ...props, list: config.list });
  const asyncHooks = usePromise(config.fetchCb, { ...config });

  const params = {
    ...selectHooks,
    ...asyncHooks,
    currentPage,
    pageSize,
    list,
    total,
    fetchBegin,
    fetch,
    updatePage,
    updatePageSize,
  };
  const proxy = reactive(params);
  params.proxy = proxy;

  const time0 = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 0);
    });
  };

  const mergeEvent = nextTaskHoc()(time0);

  function fetchBegin(...arg) {
    currentPage.value = config.currentPage;
    pageSize.value = config.pageSize;
    total.value = config.total;
    list.value = config.list;
    return asyncHooks.fetchBegin(...arg).then(() => {
      total.value = config.formatterTotal(proxy);
      list.value = config.formatterList(proxy);
      selectHooks.updateListAndReset(list.value);
    });
  }

  function fetch(...arg) {
    return asyncHooks.fetch(...arg).then(() => {
      total.value = config.formatterTotal(proxy);
      list.value = config.formatterList(proxy);
      selectHooks.updateListAndReset(list.value);
    });
  }

  async function serverPaging() {
    if (!config.serverPaging) return;
    await mergeEvent();
    return fetch();
  }

  async function updatePage(p) {
    currentPage.value = p;
    serverPaging();
  }

  async function updatePageSize(size) {
    pageSize.value = size;
    serverPaging();
  }

  return params;
}
