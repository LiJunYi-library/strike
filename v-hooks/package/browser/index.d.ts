export function useResizeObserver(el: any, cb: ResizeObserverCallback): ResizeObserver;
export function useResizeObserver(
  el: () => HTMLElement,
  cb: ResizeObserverCallback
): ResizeObserver;

export declare function useLocalStorageRef<T>(key: string, defaultValue?: T): Ref<T>;
