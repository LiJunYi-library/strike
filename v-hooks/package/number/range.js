import { ref, reactive, computed, watch } from "vue";
import { useRadio2 } from "../list";
import { useReactive } from "../../other";

function RangeNumber(props = {}) {
  const config = {
    min: "",
    max: "",
    ...props,
  };
  const min = ref(config.min);
  const max = ref(config.max);
  function updateMin(value) {
    min.value = value;
  }

  function updateMax(value) {
    max.value = value;
  }

  function reset() {
    min.value = "";
    max.value = "";
  }

  function verifyChange() {
    if (min.value && max.value && min.value * 1 > max.value * 1) {
      const mi = min.value;
      const ma = max.value;
      min.value = Math.min(mi, ma);
      max.value = Math.max(mi, ma);
    }
  }

  return { min, max, updateMin, updateMax, reset, verifyChange };
}

export function useRangeNumber(props = {}) {
  const config = {
    min: "",
    max: "",
    ...props,
  };

  let context;
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

  context = params;

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

export function useRangeNumberList(config = {}) {
  const props = {
    ...config,
    formatterMin: (item) => item?.min,
    formatterMax: (item) => item?.max,
  };

  const list = useRadio2({
    value: [props.min, props.max].join("-"),
    formatterValue: (item) => [props.formatterMin(item), props.formatterMax(item)].join("-"),
    ...props,
  });

  const rang = useRangeNumber(props);
  let lock = false;

//  Object.assign(list.store, rang.store);

  watch(
    () => list.select,
    (item) => {
      if (lock === true) {
        lock = false;
        return;
      }
      rang.updateMin(props.formatterMin(item));
      rang.updateMax(props.formatterMax(item));
    }
  );

  function updateMin(value) {
    rang.updateMin(value);
    const values = [rang.min, rang.max].join("-");
    lock = true;
    list.updateValue(values);
  }

  function updateMax(value) {
    rang.updateMax(value);
    const values = [rang.min, rang.max].join("-");
    lock = true;
    list.updateValue(values);
  }

  function save() {
    rang.save();
    list.save();
  }

  function restore() {
    rang.restore();
    list.restore();
  }

  function changeContextToStore() {
    rang.changeContextToStore();
    list.changeContextToStore();
  }

  function changeContextToProxy() {
    rang.changeContextToProxy();
    list.changeContextToProxy();
  }

  function save_changeContextToStore() {
    rang.save_changeContextToStore();
    list.save_changeContextToStore();
  }

  function restore_changeContextToProxy() {
    rang.restore_changeContextToProxy();
    list.restore_changeContextToProxy();
  }

  const params = useReactive({
    ...rang.getProto(),
    ...list.getProto(),
    // updateMin,
    // updateMax,
    // save,
    // restore,
    // changeContextToStore,
    // changeContextToProxy,
    // save_changeContextToStore,
    // restore_changeContextToProxy,
  });
  return params;
}
