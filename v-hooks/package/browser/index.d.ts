export function useResizeObserver(el: any, cb: ResizeObserverCallback): ResizeObserver;
export function useResizeObserver(
  el: () => HTMLElement,
  cb: ResizeObserverCallback
): ResizeObserver;

type useLocalStorageRefConfig = {
  isListener?: Boolean;
  onListener: (event: StorageEvent) => void;
};
export declare function useLocalStorageRef<T>(
  key: string,
  defaultValue?: T,
  config?: useLocalStorageRefConfig
): Ref<T>;

export declare function useCookie<T>(key: string, defaultValue?: T): Ref<T>;
