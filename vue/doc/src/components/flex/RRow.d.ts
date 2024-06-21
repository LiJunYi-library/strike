import { DefineComponent, ComponentPropsOptions, ExtractPublicPropTypes, EmitsOptions } from "vue";

export interface RRowProps {
  reverse: boolean;
  wrap: boolean;
  fill: boolean;
  justify: "start" | "end" | "around" | "between" | "evenly" | "center" | "stretch" | "";
  align: "start" | "end" | "center" | "stretch" | "baseline" | "";
  alignSelf: "start" | "end" | "center" | "stretch" | "baseline" | "";
  auto: "top" | "bottom" | "left" | "right" | "center" | "horizontal" | "vertical" | "";
}

export type RRowEmits = {};

type RevEmits<T extends EmitsOptions> = T extends string[]
  ? { [K in Capitalize<T[number]>]: ((...args: any[]) => any) | null }
  : T;

export type RRowComponent<
  P extends Readonly<ComponentPropsOptions>,
  E extends EmitsOptions,
> = DefineComponent<
  ExtractPublicPropTypes<RRowProps & P>,
  {},
  {},
  any,
  {},
  any,
  any,
  RRowEmits & RevEmits<E>
>;

export declare const RRow: RRowComponent<RRowProps, RRowEmits>;
