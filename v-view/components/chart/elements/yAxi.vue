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
  },
  setup(props, ctx) {
    const yAxi = reactive({
      props,
      attrs: {
        type: "value",
        axisLabel: {
          formatter: function (value) {
            const val = value + "";
            if (val.length > 8) return value / 100000000 + "亿";
            if (val.length > 4) return value / 10000 + "万";
            return value;
          },
        },
        ...ctx.attrs,
      },
    });

    const ChartContext = inject("ChartContext") || {};

    ChartContext?.yAxis.push(yAxi);

    onBeforeUnmount(() => {
      ChartContext.yAxis = ChartContext?.yAxis.filter((el) => el !== yAxi);
    });

    return () => {
      return null;
    };
  },
});
</script>
