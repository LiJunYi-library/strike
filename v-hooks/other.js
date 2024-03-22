import { reactive, customRef, watch } from "vue";

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
  return proxy;
}

export function mergeContext(...hooks) {
  function save() {
    hooks.forEach((val) => val.save());
  }

  function restore() {
    hooks.forEach((val) => val.restore());
  }

  function changeContextToStore() {
    hooks.forEach((val) => val.changeContextToStore());
  }

  function changeContextToProxy() {
    hooks.forEach((val) => val.changeContextToProxy());
  }

  function save_changeContextToStore() {
    hooks.forEach((val) => val.save_changeContextToStore());
  }

  function restore_changeContextToProxy() {
    hooks.forEach((val) => val.restore_changeContextToProxy());
  }

  return {
    save,
    restore,
    changeContextToStore,
    changeContextToProxy,
    save_changeContextToStore,
    restore_changeContextToProxy,
  };
}

export function useModelWatch(props, context, key) {
  let value = props[key];
  const mRef = customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        value = newValue;
        context.emit("onUpdate:" + key, newValue);
        trigger();
      },
    };
  });

  watch(
    () => value,
    (newVal) => {
      if (mRef.value === newVal) return;
      mRef.value = newVal;
    }
  );

  return mRef;
}
