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
import { useLocalStorageRef } from "./localStorage";

function parseCookie(cookieString) {
  const cookies = {};
  const cookiePairs = cookieString.split(";");
  for (const pair of cookiePairs) {
    const [name, value] = pair.trim().split("=");
    cookies[name] = decodeURIComponent(value);
  }
  return cookies;
}

export function useCookie(...arg) {
  if (arg.length === 1) return handleCookie(arg[0]);
  const [key, defaultValue] = arg;
  return handleCookie({ key, defaultValue });
}

function handleCookie({ key, defaultValue, CookieAttributes = {}, onChange }) {
  const storage = useLocalStorageRef(key, defaultValue, {
    onChange: onListener,
  });

  const cookies = parseCookie(document.cookie);

  function setCookie(keyVal, valueVal) {
    document.cookie = [keyVal, valueVal].join("=");
    // console.log("document.cookie =", [keyVal, valueVal].join("="));
  }

  const cookieVal = (() => {
    const cV = cookies[key];
    if (cV === undefined) {
      setCookie(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    if (cV === "undefined") return undefined;
    return JSON.parse(cV);
  })();

  const val = ref(cookieVal);

  function onListener(event) {
    val.value = event._r_value;
    if (onChange) onChange(event);
  }

  watch(
    val,
    (newValue) => {
      const newVal = isRef(newValue) ? newValue.value : newValue;
      storage.value = newVal;
      setCookie(key, JSON.stringify(newVal));
    },
    { deep: true }
  );

  return val;
}
