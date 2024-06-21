import { DefineComponent, ComponentPropsOptions, ExtractPublicPropTypes, EmitsOptions } from "vue";

export interface RColumnProps {
  reverse: boolean;
  wrap: boolean;
  fill: boolean;
  justify: "start" | "end" | "around" | "between" | "evenly" | "center" | "stretch" | "";
  align: "start" | "end" | "center" | "stretch" | "baseline" | "";
  alignSelf: "start" | "end" | "center" | "stretch" | "baseline" | "";
  auto: "top" | "bottom" | "left" | "right" | "center" | "horizontal" | "vertical" | "";
}

export type RColumnEmits = {};

type RevEmits<T extends EmitsOptions> = T extends string[]
  ? { [K in Capitalize<T[number]>]: ((...args: any[]) => any) | null }
  : T;

export type RColumnComponent<
  P extends Readonly<ComponentPropsOptions>,
  E extends EmitsOptions,
> = DefineComponent<
  ExtractPublicPropTypes<RColumnProps & P>,
  {},
  {},
  any,
  {},
  any,
  any,
  RColumnEmits & RevEmits<E>
>;

export declare const RColumn: RColumnComponent<RColumnProps, RColumnEmits>;
