import { defineComponent, reactive, renderSlot, ref, computed } from "vue";
import { RNumberRange } from "./range";
import { RListSelect } from "../list";

export const RNumberRangeList = defineComponent({
  props: {
    listHook: Object,
  },
  setup(props, context) {
    return () => {
      const attrs = { ...context.attrs, class: "", style: "" };
      return (
        <div class={["r-number-range-list r-list-select-grid"]}>
          <RListSelect listHook={props.listHook} {...attrs}></RListSelect>
          <RNumberRange listHook={props.listHook} {...attrs}></RNumberRange>
        </div>
      );
    };
  },
});
