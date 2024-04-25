<script lang="jsx">
import { onBeforeUnmount, inject, reactive, defineComponent } from "vue";
import { merge } from "../index.vue";

const option = (props) => {
  return {
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
  };
};

export function XaxiHoc(options = {}) {
  const config = {
    props: {},
    option: {},
    ...options,
  };
  return defineComponent({
    inheritAttrs: false,
    props: {
      option: { type: Object, default: (...arg) => option(...arg) },
      property: { type: String, default: "" },
      formatter: Function,
      rotate: { type: Number, default: 0 },
      ...config.props,
    },
    setup(props, ctx) {
      const xAxi = reactive({
        props,
        attrs: merge(props.option, ctx.attrs),
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
}

export default XaxiHoc();
</script>
