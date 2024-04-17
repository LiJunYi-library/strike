import {
  defineComponent,
  renderSlot,
  computed,
  onMounted,
  onBeforeUnmount,
  inject,
  reactive,
  ref,
  customRef,
  watch,
  isRef,
} from "vue";

function localStorageRef(props = {}) {
  const config = {
    isListener: true,
    onChange: () => undefined,
    key: "store",
    defaultValue: undefined,
    ...props,
  };

  window.addEventListener("storage", onStorageChange);
  onBeforeUnmount(() => {
    window.removeEventListener("storage", onStorageChange);
  });

  const storageStr = window.localStorage.getItem(config.key);
  const storageVal = (() => {
    if (storageStr === "undefined") return undefined;
    if (storageStr === null) {
      if (config.defaultValue !== undefined) {
        window.localStorage.setItem(config.key, JSON.stringify(config.defaultValue));
      }
      return config.defaultValue;
    }
    return JSON.parse(storageStr);
  })();

  const val = ref(storageVal);

  function onStorageChange(event) {
    if (event.key !== config.key) return;
    if (config.isListener) changeVal(event);
    config?.onChange?.(event);
  }

  function changeVal(event) {
    const str = window.localStorage.getItem(config.key);
    const sv = (() => {
      if (str === "undefined") return undefined;
      return JSON.parse(str);
    })();
    event._r_value = sv;
    val.value = sv;
  }

  watch(
    val,
    (newValue) => {
      const newVal = isRef(newValue) ? newValue.value : newValue;
      window.localStorage.setItem(config.key, JSON.stringify(newVal));
    },
    { deep: true }
  );

  return val;
}

export function useLocalStorageRef(...args) {
  if (args.length === 1) return localStorageRef(args[0]);
  if (args.length === 2) return localStorageRef({ key: args[0], defaultValue: args[1] });
  const props = args[2] || {};
  return localStorageRef({
    key: args[0],
    defaultValue: args[1],
    ...props,
  });
}

function dateLocalStorageRef(props = {}) {
  const config = {
    key: "store",
    formatterTime: (date) => [date.getFullYear(), date.getMonth(), date.getDate()].join("-"),
    defaultValue: undefined,
    ...props,
  };

  function getTime() {
    const date = new Date();
    const time = config.formatterTime(date);
    return time;
  }

  const def = {
    date: getTime(),
    value: config.defaultValue,
  };

  const val = useLocalStorageRef(config);

  if (val.value?.date && val.value.date !== def.date) val.value = def;

  return computed({
    set(newV) {
      val.value = {
        date: getTime(),
        value: newV,
      };
    },
    get() {
      if (val.value?.date !== getTime()) {
        val.value = {
          date: getTime(),
          value: config.defaultValue,
        };
      }
      return val.value.value;
    },
  });
}

export function useDateLocalStorageRef(...args) {
  if (args.length === 1) return dateLocalStorageRef(args[0]);
  return dateLocalStorageRef({
    key: args[0],
    defaultValue: args[1],
  });
}
