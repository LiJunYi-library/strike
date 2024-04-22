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
    return arr;
  });

  const error = computed(() => hooks.value.some((el) => el?.error === true));

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

    return arr;
  });

  const begin = computed(() => lHooks.value.some((el) => el?.begin === true));

  const loading = computed(() => lHooks.value.some((el) => el?.loading === true));

  return useReactive({ loading, error, begin });
}
