import { ReactiveEffect, UnwrapNestedRefs, Ref } from "vue";
import { PromiseHooks, AsyncFun, PromiseConfig } from "../promise";

export declare class Radio {
  constructor(params: any);
}

export declare function useList(options: any): any;

export declare function useLazyList(options: any): any;

export declare function usePagination(options: any): any;

export declare function useListSelect(options: any): any;

export declare function useListLoad(options: any): any;

export declare function useRadio(options: any): any;
export declare function useAsyncRadio(options: any): any;

/*********
 *
 *
 *
 *
 *
 *
 *
 * ******** */

export declare function useListRadio<T>(options: any): [
  [Ref<any>, Ref<T>, Ref<number>, Ref<string>, Ref<T[]>],
  [
    (item: T, index: number) => void,
    (val: any) => void,
    (item: T) => boolean,
    () => void,
    () => void,
    () => void,
    (list: T[]) => void
  ],
  {
    activeValue: Ref<any>;
    activeItem: Ref<T>;
    activeIndex: Ref<number>;
    activeLable: Ref<string>;
    listData: Ref<T[]>;
  },
  {
    changeItem: (item: T, index: number) => void;
    setValue: (val: any) => void;
    same: (item: T) => boolean;
    reset: () => void;
    save: () => void;
    restore: () => void;
    setData: (list: T[]) => void;
  }
];

export declare function useAsyncListRadio<T>(options: any): any;

export declare function useListMultiple(options: any): [...any];

/**
 *
 */
export declare type FetchListHooks = PromiseHooks & {
  list: any[];
  begin: boolean;
  fetch: AsyncFun;
};
export declare type FetchListConfig = PromiseConfig & {
  fetchCB?: AsyncFun;
  formatterList?: (hooks: FetchListHooks) => any[];
};
export declare function getFetchListConfig(options: FetchListConfig): FetchListConfig;
export declare function useFetchList(options: FetchListConfig): FetchListHooks;

/**
 *
 */
export declare type PaginationListHooks = FetchListHooks & {
  currentPage: number;
  pageSize: number;
  total: number;
  finished: boolean;
  currentSize: number;
  resolve: (accumulation: boolean) => void;
  beginning: AsyncFun;
  concat: AsyncFun;
  replace: AsyncFun;
  reset: AsyncFun;
  fetch: AsyncFun;
};
export declare type PaginationListConfig = FetchListConfig & {
  _super?: FetchListConfig;
  formatterTotal?: (PaginationListHooks) => number;
  formatterFinished?: (PaginationListHooks) => boolean;
  formatterCurrentPage?: (PaginationListHooks) => number;
  formatterList?: (PaginationListHooks) => any[];
  serverPaging?: boolean;
  currentPage?: number;
  pageSize?: number;
  total?: number;
};
export declare function getPaginationConfig(options: PaginationListConfig): PaginationListConfig;
export declare function usePaginationList(options: PaginationListConfig): PaginationListHooks;
/**
 *
 *
 */
export declare type TablePaginationHooks = PaginationListHooks & {
  onPageChange: (currentPage: number, pageSize: number) => void;
};
export declare function useTablePagination(options: PaginationListConfig): TablePaginationHooks;
