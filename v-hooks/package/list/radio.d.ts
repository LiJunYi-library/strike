type Funs = {
  /**
   * @param value 更新 value
   */
  updateValue(value: any): any;
  /**
   * @param index 更新 index
   */
  updateIndex(index: any): any;
  /**
   * @param label 更新 label
   */
  updateLabel(options: any): any;
  /**
   * @param select  更新 select 接收一个数组中的值
   */
  updateSelect(select: any): any;
  /**
   * @param select  更新 select 接收一个回调函数用于更新 find的用法
   */
  updateSelect(fun: (item: never, index: number, list: never[]) => boolean): any;

  transform(options: any): any; // 废弃
  transformStore(options: any): any;
  transformParams(options: any): any;
  save(options: any): any;
  restore(options: any): any;
  onSelect(options: any): any;
  same(options: any): any;
  reset(options: any): any;
  formatterValue(options: any): any;
  formatterLabel(options: any): any;
  formatterDisabled(options: any): any;
  updateList(options: any): any;
  resolveList(options: any): any;
  resolveValue(options: any): any;
  verifyValueInList(options: any): any;
  updateListAndReset(options: any): any;
  updateListToResolveValue(options: any): any;
  getSelectOfValue(options: any): any;
  selectOfValue(options: any): any;
  getLabelOfValue(options: any): any;
  labelOfValue(options: any): any;
  getIndexOfValue(options: any): any;
  indexOfValue(options: any): any;
  someValue(options: any): any;
};

type Proxy = {
  list: any[];
  select: any;
  value: any;
  label: any;
  index: any;
  store: Store;
} & Funs;

type Store = {
  list: any[];
  select: any;
  value: any;
  label: any;
  index: any;
};

export declare function useRadio(options: any): {
  proxy: Proxy;
  store: Store;
} & Funs;
