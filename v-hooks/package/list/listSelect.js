import { ref, reactive, computed, watch } from "vue";
import { usePromise, getPromiseConfig, useInterceptPromiseApply } from "../promise";
import { useSelect } from "./select";
import { useList } from "./list";

export { getListSelectProps, useListSelect };

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
