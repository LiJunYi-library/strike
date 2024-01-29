import { reactive } from "vue";

export function useProxy(hooks = {}) {
  const proxy = reactive(hooks);
  proxy.getProto = () => hooks;
  proxy.proto = hooks;
  proxy.proxy = proxy; // TODO
  hooks.proxy = proxy;
  return hooks;
}

export function useReactive(hooks = {}) {
  const proxy = reactive(hooks);
  proxy.getProto = () => hooks;
  proxy.proto = hooks;
  hooks.proxy = proxy;
  return hooks;
}
