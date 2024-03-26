<script lang="jsx">
import {
  onMounted,
  onBeforeUnmount,
  ref,
  renderSlot,
  inject,
  reactive,
  defineComponent,
} from "vue";

export default defineComponent({
  inheritAttrs: false,
  props: {
    property: { type: String, default: "" },
    formatter: Function,
    rotate: { type: Number, default: 0 },
  },
  setup(props, ctx) {
    const xAxi = reactive({
      props,
      attrs: {
        nameLocation: "start",
        axisLabel: {
          rotate: props.rotate,
          hideOverlap: false,
          fontSize: 10,
          overflow: "break",
        },
        type: "category",
        boundaryGap: "0%",
        axisTick: {
          alignWithLabel: true,
        },
        ...ctx.attrs,
      },
    });

    const ChartContext = inject("ChartContext") || {};

    ChartContext?.xAxis.push(xAxi);

    onBeforeUnmount(() => {
      ChartContext.xAxis = ChartContext?.xAxis.filter((el) => el !== xAxi);
    });

    return () => {
      return null;
    };
  },
});
</script>
