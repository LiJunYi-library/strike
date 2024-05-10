import { ComponentObjectPropsOptions, EmitsOptions } from "vue";

export interface HocOptions<
  P = ComponentObjectPropsOptions,
  E extends EmitsOptions,
  EE extends string = string,
> {
  props: P & ThisType<void>;
  emits: E;
  className?: string | string[];
}
