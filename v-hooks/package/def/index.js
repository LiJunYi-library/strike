export function useDebounced(cb, delay = 500) {
  let timeout;
  const fun = (...arg) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...arg);
    }, delay);
  };
  return fun;
}

export function useThrottle(cb, delay = 500) {
  let bool = false;
  const fun = (...arg) => {
    if (bool) return;
    bool = true;
    cb(...arg);
    setTimeout(() => {
      bool = false;
    }, delay);
  };
  return fun;
}
