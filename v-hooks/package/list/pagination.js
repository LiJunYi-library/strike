import { ref, reactive, computed, watch } from "vue";
import { usePromiseTask } from "../promise";
import { useSelect } from "./select";
import { useList } from "./list";

export { getPaginationProps, usePagination };
function getPaginationProps(options = {}) {
  const config = {
    serverPaging: false,
    currentPage: 1,
    pageSize: 10,
    total: 0,
    fetchMethod: undefined,
    afterSetList: () => undefined,
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
      // return _super.formatterList(hooks);
    },
    formatterFinished: ({ total, currentSize }) => {
      return currentSize >= total;
    },
    formatterCurrentPage: ({ currentPage }) => {
      return currentPage + 1;
    },
    ...options,
    listSource: options.list || [],
  };

  return config;
}

function usePagination(props = {}) {
  const config = getPaginationProps(props);

  const listHooks = useList(props);

  const paginationHooks = usePagination2({ ...config, listSource: listHooks.list.value });

  const selectHooks = useSelect({ ...props, list: paginationHooks.list.value });

  const promiseTask = config.fetchMethod
    ? usePromiseTask(config.fetchMethod, {
        then: (data) => {
          listHooks.updateList(data);
        },
      })
    : {};

  listHooks.afterSetList = (hooks, type) => {
    // console.log("listHooks.afterSetList", type < 1);
    if (type < 1) paginationHooks.updateListAndReset(listHooks.list.value);
    else paginationHooks.updateList(listHooks.list.value);
    // selectHooks.resolveList(paginationHooks.list.value);
  };

  paginationHooks.afterSetList = () => {
    // console.log("paginationHooks.afterSetList", paginationHooks.list.value);
    selectHooks.resolveList(paginationHooks.list.value);
  };

  const arguments_ = {
    ...promiseTask,
    ...selectHooks,
    ...paginationHooks,
    ...listHooks,
    list: paginationHooks.list,
  };
  arguments_.proxy = reactive(arguments_);
  return arguments_;
}

function usePagination2(props = {}) {
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

  const arguments_ = {
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
  const proxy = reactive(arguments_);
  arguments_.proxy = proxy;

  function paginationConcat() {
    if (finished.value) return;
    currentPage.value++;
    const arr = paging(proxy);
    list.value = list.value.concat(arr);
    arguments_.afterSetList(arguments_);
  }

  function paginationNext() {
    if (paginationNextDisabled.value) return;
    currentPage.value++;
    const arr = paging(proxy);
    list.value = arr;
    arguments_.afterSetList(arguments_);
  }

  function paginationPrev() {
    if (paginationPrevDisabled.value) return;
    currentPage.value--;
    const arr = paging(proxy);
    list.value = arr;
    arguments_.afterSetList(arguments_);
  }

  function updatePage(p) {
    currentPage.value = p;
    const arr = paging(proxy);
    list.value = arr;
    arguments_.afterSetList(arguments_);
  }

  function updatePageSize(size) {
    pageSize.value = size;
    if (currentPage.value > maxPage.value) currentPage.value = maxPage.value;
    list.value = paging(proxy);
    arguments_.afterSetList(arguments_);
  }

  function updatePagination(page, size) {
    currentPage.value = page;
    pageSize.value = size;
    const arr = paging(proxy);
    list.value = arr;
    arguments_.afterSetList(arguments_);
  }

  function reset() {
    currentPage.value = 1;
    pageSize.value = config.pageSize;
    list.value = paging(proxy);
    arguments_.afterSetList(arguments_);
  }

  function updateList(l) {
    listSource.value = l;
    if (currentPage.value > maxPage.value) currentPage.value = maxPage.value;
    list.value = paging(proxy);
    arguments_.afterSetList(arguments_);
  }

  function updateListAndReset(l) {
    listSource.value = l;
    arguments_.reset();
  }

  return arguments_;
}
