import { defineComponent, reactive, renderSlot, ref, computed } from "vue";

export const RNumberRange = defineComponent({
  props: {
    listHook: Object,
  },
  setup(props, context) {
    const min = computed({
      get: () => props.listHook.getContext().min,
      set: (val) => {
        props.listHook.updateMin(val);
      },
    });

    const max = computed({
      get: () => props.listHook.getContext().max,
      set: (val) => {
        props.listHook.updateMax(val);
      },
    });

    return () => {
      return (
        <div class={["r-number-range"]}>
          <input class="r-input-min" type="number" v-model={min.value}></input>
          <div> - </div>
          <input class="r-input-max" type="number" v-model={max.value}></input>
        </div>
      );
    };
  },
});
