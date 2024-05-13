import { DefineComponent, ComponentPropsOptions, ExtractPublicPropTypes, EmitsOptions } from "vue";

export interface RScrollTopProps {
  text: string;
  maxLine: number;
  isFold: boolean;
  animation: boolean;

  src: any;
  isBack: boolean;
  behavior: "smooth" | "instant"; // smooth  instant
  backText: string;
  topText: string;

  left: number | string;
  right: number | string;
  top: number | string;
  bottom: number | string;
  visibleLeft: number | string;
  visibleRight: number | string;
  visibleTop: number | string;
  visibleBottom: number | string;
  horizontal: string;
  vertical: string;
}

export type RScrollTopEmits = {
  scrollTop: (scrollTop: number) => void;
  scrollBack: (scrollTop: number) => void;
};

type RevEmits<T extends EmitsOptions> = T extends string[]
  ? { [K in Capitalize<T[number]>]: ((...args: any[]) => any) | null }
  : T;

export type RScrollTopComponent<
  P extends Readonly<ComponentPropsOptions>,
  E extends EmitsOptions,
> = DefineComponent<
  ExtractPublicPropTypes<RScrollTopProps & P>,
  {},
  {},
  any,
  {},
  any,
  any,
  RScrollTopEmits & RevEmits<E>
>;

export declare const RScrollTop: RScrollTopComponent<RScrollTopProps, RScrollTopEmits>;
