import { defineComponent, computed } from "vue";

export const RNumberRange = defineComponent({
  props: {
    listHook: Object,
  },
  setup(props, context) {
    const min = computed({
      get: () => {
        return props.listHook.context.SH.min;
      },
      set: (val) => {
        props.listHook.updateMin(val);
      },
    });

    const max = computed({
      get: () => {
        return props.listHook.context.SH.max;
      },
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
