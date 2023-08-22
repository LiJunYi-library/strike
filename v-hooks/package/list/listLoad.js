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
      return res.total;
    },
    setFinished: (list, total, res) => {
      return list.length >= total;
    },
    fetchCB: () => undefined,
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

  const asyncHooks = usePromise(config.fetchCb, {
    ...config,
    then: (data) => {
      radioHooks.updateListToResolveValue(data);
    },
  });

  const arguments_ = { ...asyncHooks };
  arguments_.proxy = reactive(arguments_);
  return arguments_;
}
