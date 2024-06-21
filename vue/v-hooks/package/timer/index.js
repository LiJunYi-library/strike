import { reactive, ref, computed, onBeforeUnmount } from "vue";
import { useReactive } from "../../other";

export function useSetInterval(callback, ms) {
  const timer = setInterval(callback, ms);
  onBeforeUnmount(() => {
    clearInterval(timer);
  });
  return timer;
}

export function useSetTimeout(callback, ms) {
  const timer = setTimeout(callback, ms);
  onBeforeUnmount(() => {
    clearTimeout(timer);
  });
  return timer;
}

export function useTimerLock(props = {}) {
  const config = {
    automation: true,
    interval: 1000,
    time: 60 * 1000,
    numRef: ref,
    pauseRef: ref,
    onFinish: () => undefined,
    ...props,
  };

  const num = config.numRef(0);
  let initNum = num.value;
  const lock = computed(() => num.value <= 0);
  let t;
  const isPause = config.pauseRef(false);

  function runTimer() {
    if (num.value <= 0) {
      if (initNum > 0) {
        initNum = num.value;
        config.onFinish();
      }
      return;
    }
    clearTimeout(t);
    t = setTimeout(() => {
      num.value--;
      runTimer();
    }, config.interval);
  }

  function afresh(tiNum = config.time / 1000) {
    num.value = tiNum;
    initNum = num.value;
    runTimer();
  }

  function pause() {
    clearTimeout(t);
    isPause.value = true;
  }

  function Continue() {
    if (!isPause.value) return;
    isPause.value = false;
    runTimer();
  }

  onBeforeUnmount(() => {
    clearTimeout(t);
  });

  if (config.automation && isPause.value === false) runTimer();
  return useReactive({ num, lock, isPause, afresh, pause, Continue });
}
