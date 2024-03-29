import { ref, useMemoProxy, useProxy, refs } from "../utils/ref";

function load(props = {}) {
  const loadingsArr = [];
  const promisArr = [];
  (() => {
    if (!props.promiseHooks) return;
    if (props.promiseHooks instanceof Array) {
      promisArr.push(...props.promiseHooks);
      loadingsArr.push(...props.promiseHooks);
    } else {
      promisArr.push(props.promiseHooks);
      loadingsArr.push(props.promiseHooks);
    }
  })();
  (() => {
    if (!props.loadingHooks) return;
    if (props.loadingHooks instanceof Array) loadingsArr.push(...props.loadingHooks);
    else loadingsArr.push(props.loadingHooks);
  })();
  const loadings = loadingsArr.map((item) => item.loading);
  const begins = loadingsArr.map((item) => item.begin);
  const begin = begins.some((el) => el === true);
  const loading = loadings.some((el) => el === true);
  const memos = [...loadings, ...begins];
  return { begin, loading, memos };
}

export function computeLoading(props = {}) {
  const states = load(props);
  const loading = ref(states.loading);
  const begin = ref(states.begin);
  return useMemoProxy(() => {
    const statess = load(props);
    loading.value = statess.loading;
    begin.value = statess.begin;
    return { loading, begin, memos: refs(loading, begin) };
  }, states.memos);
}
