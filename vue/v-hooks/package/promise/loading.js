import { computed } from "vue";
import { useReactive } from "../../other";

export function useLoading(props) {
  const hooks = computed(() => {
    const arr = [];
    (() => {
      if (!props.promiseHook) return;
      if (props.promiseHook instanceof Array) arr.push(...props.promiseHook);
      else arr.push(props.promiseHook);
    })();
    return arr.filter(Boolean);
  });

  const error = computed(() => hooks.value.some((el) => el?.error === true));

  const empty = computed(() => {
    if (hooks.value.every((el) => el.empty === undefined)) return undefined;
    return hooks.value.some((el) => el?.empty === true);
  });

  const finished = computed(() => {
    if (hooks.value.every((el) => el.finished === undefined)) return undefined;
    return hooks.value.some((el) => el?.finished === true);
  });

  const lHooks = computed(() => {
    const arr = [];

    (() => {
      if (!props.promiseHook) return;
      if (props.promiseHook instanceof Array) arr.push(...props.promiseHook);
      else arr.push(props.promiseHook);
    })();

    (() => {
      if (!props.loadingHook) return;
      if (props.loadingHook instanceof Array) arr.push(...props.loadingHook);
      else arr.push(props.loadingHook);
    })();

    return arr.filter(Boolean);
  });

  const begin = computed(() => lHooks.value.some((el) => el?.begin === true));

  const loading = computed(() => lHooks.value.some((el) => el?.loading === true));

  return useReactive({ begin, loading, error, empty, finished });
}
