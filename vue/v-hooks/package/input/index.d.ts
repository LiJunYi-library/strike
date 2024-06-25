export declare function useInput(props: {
  required?: boolean;
  requiredMessage?: string;
  requiredVerify?: (val: any) => boolean;
  onRequired?: (val: any, consig: this) => any;
  value?: any;
  ref?: (...arg: any) => any;
}): any;
