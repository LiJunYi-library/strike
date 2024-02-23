import { computed } from "vue";
import { useReactive } from "../../other";

export function useLoading(props) {
  const { loadingHook, promiseHook } = props;

  const hooks = computed(() => {
    const arr = [];
    (() => {
      if (!promiseHook) return;
      if (promiseHook instanceof Array) arr.push(...promiseHook);
      else arr.push(promiseHook);
    })();
    return arr;
  });

  const error = computed(() => hooks.value.some((el) => el?.error === true));

  const lHooks = computed(() => {
    const arr = [];

    (() => {
      if (!promiseHook) return;
      if (promiseHook instanceof Array) arr.push(...promiseHook);
      else arr.push(promiseHook);
    })();

    (() => {
      if (!loadingHook) return;
      if (loadingHook instanceof Array) arr.push(...loadingHook);
      else arr.push(loadingHook);
    })();

    return arr;
  });

  const begin = computed(() => lHooks.value.some((el) => el?.begin === true));

  const loading = computed(() => lHooks.value.some((el) => el?.loading === true));

  return useReactive({ loading, error, begin });
}
