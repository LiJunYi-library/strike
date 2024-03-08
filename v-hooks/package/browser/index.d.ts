export function useResizeObserver(el: any, cb: ResizeObserverCallback): ResizeObserver;
export function useResizeObserver(
  el: () => HTMLElement,
  cb: ResizeObserverCallback
): ResizeObserver;

type useIntersectionObserverConfig = {
  el: HTMLElement | (() => HTMLElement);
  cb: IntersectionObserverCallback;
  intersectionConfig?: IntersectionObserverInit;
};
export function useIntersectionObserver(props: useIntersectionObserverConfig): IntersectionObserver;

type useLocalStorageRefConfig = {
  isListener?: boolean;
  onListener: (event: StorageEvent) => void;
};
export declare function useLocalStorageRef<T>(
  key: string,
  defaultValue?: T,
  config?: useLocalStorageRefConfig
): Ref<T>;

export declare function useCookie<T>(key: string, defaultValue?: T): Ref<T>;

export declare function useBroadcast(
  channelKey: string,
  key: string,
  expose: any
): BroadcastChannel;
