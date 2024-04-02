import { reactive, customRef, watch } from "vue";
import { createOverload } from "@rainbow_ljy/rainbow-js";

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

export function mergeSaveContext(...args) {
  const hooks = args.filter(Boolean);
  const refs = {};
  hooks.forEach((hook) => Object.assign(refs, hook?.context?.getRefs?.()));
  const contextHooks = createSaveContext(refs);
  hooks.forEach((hook) => Object.assign(hook, contextHooks));
  return contextHooks;
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

function assign(target = {}, source = {}) {
  for (const key in source) {
    if (Object.hasOwnProperty.call(source, key)) {
      const el = source[key];
      if (el instanceof Array) target[key] = [...source[key]];
      else target[key] = source[key];
    }
  }
}

export function createSaveContext(refs, argStores) {
  const states = reactive(refs);
  const stores = argStores || reactive({ ...states });
  const context = { stores, refs, states, getRefs: () => refs, SH: states };

  function save() {
    assign(context.stores, context.states);
  }

  function restore() {
    assign(context.states, context.stores);
  }

  function changeContextToStore() {
    context.SH = context.stores;
  }

  function changeContextToProxy() {
    context.SH = context.states;
  }

  function save_changeContextToStore() {
    save();
    changeContextToStore();
  }

  function restore_changeContextToProxy() {
    restore();
    changeContextToProxy();
  }

  return {
    context,
    save,
    restore,
    changeContextToStore,
    changeContextToProxy,
    save_changeContextToStore,
    restore_changeContextToProxy,
  };
}

export function createSaveHooks({ refs, methods }) {
  const contextHooks = createSaveContext(refs);
  const hooks = useReactive({
    ...refs,
    methods,
    ...methods,
    ...contextHooks,
  });
  return hooks;
}
