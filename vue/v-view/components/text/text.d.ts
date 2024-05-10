import {
  DefineComponent,
  ComponentObjectPropsOptions,
  ComponentPropsOptions,
  ComputedOptions,
  MethodOptions,
  ComponentOptionsMixin,
  ComponentOptionsMixin,
  ExtractPropTypes,
  ExtractPublicPropTypes,
  EmitsOptions,
} from "vue";
import { HocOptions } from "../utils";

type Capitalize<S extends string> = intrinsic;

export interface RTextProps {
  text: string;
  maxLine: number;
  isFold: boolean;
  animation: boolean;
}

export type RTextEmits = {
  unfold: () => void;
  fold: () => void;
  click: (event: Event) => void;
};

// type ems = ["unfold", "fold", "click"];

// type StringArray = string[];

// type EventHandlers<T extends string[]> = {
//   [K in T[number]]?: (...args: any[]) => any;
// };

// type Events<T extends string[]> = {
//   [K in T[number]]?: (...args: any[]) => any;
// };

// type RevEmits<T extends EmitsOptions> = {
//   [K in keyof T]?: (...args: any[]) => any;
// };

type RevEmits<T extends EmitsOptions> = T extends string[]
  ? {
      [K in `${Capitalize<T[number]>}`]?: (...args: any[]) => any;
    }
  : T;

export type RTextComponent<
  P extends Readonly<ComponentPropsOptions>,
  E extends EmitsOptions,
> = DefineComponent<
  ExtractPublicPropTypes<RTextProps & P>,
  {},
  {},
  any,
  {},
  any,
  any,
  RTextEmits & RevEmits<E>
>;

export declare const RText: RTextComponent<RTextProps, RTextEmits>;

export declare function RTextHoc<P extends Readonly<ComponentPropsOptions>, E extends EmitsOptions>(
  options: HocOptions<P, E>,
): RTextComponent<P, E>;
