import { reactive } from "vue";

export function useProxy(hooks = {}) {
  const proxy = reactive(hooks);
  proxy.proto = hooks;
  hooks.proxy = proxy;
  return hooks;
}
