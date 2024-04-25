<script lang="jsx">
import { onBeforeUnmount, inject, reactive, defineComponent } from "vue";
import { merge } from "../index.vue";

const option = () => ({
  type: "value",
  axisLabel: {
    formatter: function (value) {
      const val = value + "";
      if (val.length > 8) return value / 100000000 + "亿";
      if (val.length > 4) return value / 10000 + "万";
      return value;
    },
  },
});

export function YaxiHoc(options = {}) {
  const config = {
    props: {},
    ...options,
  };
  return defineComponent({
    inheritAttrs: false,
    props: {
      option: { type: Object, default: (...arg) => option(...arg) },
      property: { type: String, default: "" },
      formatter: Function,
      ...config.props,
    },
    setup(props, ctx) {
      const yAxi = reactive({
        props,
        attrs: merge(props.option, ctx.attrs),
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
}

export default YaxiHoc();
</script>
