import { useState, useMemo } from "react";

export function ref(state) {
  const [, dispatch] = useState(state);
  return useMemo(() => {
    let cache = state;
    return {
      __isRef: true,
      set value(val) {
        dispatch(val);
        cache = val;
      },
      get value() {
        return cache;
      },
    };
  }, []);
}

export function refs(...arg) {
  return Object.defineProperties([...arg], {
    __isRefs: {
      value: true,
      writable: true,
    },
    getProto: {
      value: () => [...arg],
      writable: true,
    },
  });
}

export function useProxy(obj = {}) {
  const proxy = new Proxy(obj, {
    set(target, p, newValue) {
      const val = target[p];
      if (val?.__isRef === true) {
        val.value = newValue;
        return Reflect.set(target, p, val);
      }
      return Reflect.set(target, p, newValue);
    },
    get(target, p, receiver) {
      const val = target[p];
      if (val?.__isRef === true) return val.value;
      if (val?.__isRefs === true) return val.map((el) => el.value);
      return Reflect.get(target, p, receiver);
    },
  });
  proxy.getProto = () => obj;
  return proxy;
}

export function useMemoProxy(factory, deps = []) {
  return useMemo(() => useProxy(factory() || {}), deps);
}

export function onCreat(factory, deps = []) {
  return useMemo(factory, deps);
}

export function mergeHooks(...arg) {
  const args = arg.filter(Boolean);
  const hooks = args.map((el) => el?.getProto?.() ?? el);
  const memos = hooks.map((el) => el?.memos?.getProto?.() ?? el?.memos).flat();
  const params = Object.assign({}, ...hooks);
  params.memos = refs(...memos);
  return params;
}
