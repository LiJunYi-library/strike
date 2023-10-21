import {
  defineComponent,
  renderSlot,
  computed,
  onMounted,
  onBeforeUnmount,
  ref,
  reactive,
  provide,
} from "vue";

export const RLayoutAspectRatio = defineComponent({
  props: {
    aspectRatio: [String, Number],
    width: [String, Number],
    height: [String, Number],
  },
  setup(props, context) {
    // aspect-ratio: 1125/675;

    return (vm) => {
      return <div class="r-layout-aspect-ratio">{renderSlot(context.slots, "default")}</div>;
    };
  },
});
