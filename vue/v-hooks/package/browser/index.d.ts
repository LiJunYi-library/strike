export function useResizeObserver(
  el: any,
  cb: ResizeObserverCallback,
  time?: number
): ResizeObserver;
export function useResizeObserver(
  el: () => HTMLElement,
  cb: ResizeObserverCallback,
  time?: number
): ResizeObserver;

type useIntersectionObserverConfig = {
  el: HTMLElement | (() => HTMLElement);
  cb: IntersectionObserverCallback;
  intersectionConfig?: IntersectionObserverInit;
};
export function useIntersectionObserver(props: useIntersectionObserverConfig): IntersectionObserver;

interface useLocalStorageRefConfig<T> {
  key?: string;
  defaultValue?: T;
  isListener?: boolean;
  onListener?: (event: StorageEvent) => void;
  onChange?: (event: StorageEvent) => void;
}

export declare function useLocalStorageRef<T>(config?: useLocalStorageRefConfig<T>): Ref<T>;
export declare function useLocalStorageRef<T>(key: string, defaultValue?: T): Ref<T>;
export declare function useLocalStorageRef<T>(
  key: string,
  defaultValue?: T,
  config?: useLocalStorageRefConfig<T>
): Ref<T>;

interface useDateLocalStorageRefConfig extends useLocalStorageRefConfig {
  formatterTime: (date: Date) => string;
}

export declare function useDateLocalStorageRef<T>(config?: useDateLocalStorageRefConfig<T>): Ref<T>;

export declare function useDateLocalStorageRef<T>(key: string, defaultValue?: T): Ref<T>;

export declare function useCookie<T>(key: string, defaultValue?: T): Ref<T>;

export declare function useBroadcast(
  channelKey: string,
  key: string,
  expose: any
): BroadcastChannel;
