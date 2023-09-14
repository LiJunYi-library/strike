export * from "./package/list";
export * from "./package/tree";
export * from "./package/promise";
export * from "./package/fetch"
export * from "./package/domain-login"

export declare function useDebounced(cb: any, delay = 500): (...arg: any) => void;

export declare function useThrottle(cb: any, delay = 500): (...arg: any) => void;
