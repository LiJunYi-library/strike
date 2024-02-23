import { ref, reactive, computed, watch } from "vue";
import { usePromise2, useLoading } from "../promise";
import { useReactive } from "../../other";

export function useRangeNumber(props = {}) {
  const config = {
    min: "",
    max: "",
    ...props,
  };

  const min = ref(config.min);
  const max = ref(config.max);
  const store = reactive({
    min: "",
    max: "",
  });

  const params = useReactive({
    min,
    max,
    store,
    getContext,
    save,
    restore,
    changeContextToStore,
    changeContextToProxy,
    save_changeContextToStore,
    restore_changeContextToProxy,
    transform,
    reset,
    updateMin,
    updateMax,
    verifyChange,
  });

  let context = params;

  function getContext() {
    return context;
  }

  function save() {
    store.min = params.min;
    store.max = params.max;
  }

  function restore() {
    params.min = store.min;
    params.max = store.max;
  }

  function changeContextToStore() {
    context = store;
  }

  function changeContextToProxy() {
    context = params;
  }

  function save_changeContextToStore() {
    save();
    changeContextToStore();
  }

  function restore_changeContextToProxy() {
    restore();
    changeContextToProxy();
  }

  function transform() {
    if (context === params) return (context = store);
    if (context === store) return (context = params);
  }

  params["onUpdate:max"] = (value) => {
    context.max = value;
  };

  params["onUpdate:modelValue"] = (value) => {
    context.max = value;
  };

  params["onUpdate:min"] = (value) => {
    context.min = value;
  };

  function updateMin(value) {
    context.min = value;
  }

  function updateMax(value) {
    context.max = value;
  }

  function reset() {
    context.min = "";
    context.max = "";
  }

  function verifyChange() {
    if (context.min && context.max && context.min * 1 > context.max * 1) {
      const { min: mi, max: ma } = context;
      context.min = Math.min(mi, ma);
      context.max = Math.max(mi, ma);
    }
  }

  return params;
}
