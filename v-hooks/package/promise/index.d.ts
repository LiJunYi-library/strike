import { ReactiveEffect, UnwrapNestedRefs, Ref } from "vue";

export declare type Async = void | Promise;

export declare type Then = (data: any, loading: Ref<boolean>) => void;

export declare type Catch = (data: any, loading: Ref<boolean>) => void;

export declare type Finally = (loading: Ref<boolean>) => void;

export declare type Fun = (...arg: any) => void;

export declare type AsyncFun = (...arg: any) => Async;

export declare type BoolFun = (...arg: any) => boolean;

export declare type FormatterFun = (...arg: any) => any;

export declare type ProFun = (...arg: any) => Promise;

export declare type PromiseConfig = {
  then?: Then;
  catch?: Catch;
  verify?: BoolFun;
  finally?: Finally;
  data?: any;
  errorData?: any;
  loading?: boolean;
  error?: boolean;
  formatterData?: FormatterFun;
  formatterErrorData?: FormatterFun;
};

export declare function getPromiseConfig(options?: PromiseConfig): PromiseConfig;

/**
 *
 */
export declare function useAsync(
  fun: AsyncFun,
  config?: PromiseConfig
): { loading: boolean; error: boolean; invoker: Fun };

/**
 *
 */
export declare type PromiseHooks = {
  data: any;
  loading: boolean;
  error: boolean;
  errorData: unknown;
  run: ProFun;
};
export declare function usePromise(fun: AsyncFun, config?: PromiseConfig): PromiseHooks;

export declare function usePromiseTask(fun: AsyncFun, config?: PromiseConfig): any;

export declare function apply(fun: AsyncFun, context?: any): any;
export declare function useInterceptPromiseApply(config?: any): any;
/**
 *
 */
