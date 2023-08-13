import { ref, reactive, computed, watch } from "vue";
import { selectConfig } from "../common";
import { usePromise, getPromiseConfig, useInterceptPromiseApply } from "../promise";
import { useSelect } from "./select";

export { getListProps, useList, useLazyList, useListSelect };
export * from "./radio";
export * from "./pagination";


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
