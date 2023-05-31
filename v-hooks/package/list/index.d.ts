import { ReactiveEffect, UnwrapNestedRefs, Ref } from "vue";

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











