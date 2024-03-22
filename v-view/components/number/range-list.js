import { defineComponent, reactive, renderSlot, ref, computed } from "vue";
import { RNumberRange } from "./range";
import { RListSelect } from "../list";

export const RNumberRangeList = defineComponent({
  props: {
    listHook: Object,
  },
  setup(props, context) {
    return () => {
      return (
        <div class={["r-number-range-list r-list-select-grid"]}>
          <RListSelect listHook={props.listHook} ></RListSelect>
          <RNumberRange listHook={props.listHook}></RNumberRange>
        </div>
      );
    };
  },
});
