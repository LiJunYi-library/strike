<script lang="jsx">
import { onBeforeUnmount, provide, reactive, renderSlot, inject, defineComponent } from "vue";

const option = () => ({
  type: "bar",
  barMaxWidth: 30,
});

export const SerieHoc = (options = {}) => {
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
      name: String,
      data: [Array, Object],
      ...config.props,
    },
    setup(props, ctx) {
      const SerieContext = reactive({
        data: [],
      });

      const serie = reactive({
        props,
        context: SerieContext,
        attrs: {
          ...props.option,
          ...ctx.attrs,
        },
      });

      provide("SerieContext", SerieContext);

      const ChartContext = inject("ChartContext") || {};

      ChartContext?.series.push(serie);

      onBeforeUnmount(() => {
        ChartContext.series = ChartContext?.series.filter((el) => el !== serie);
        // console.log("onBeforeUnmount SerieContext", SerieContext);
      });

      return () => {
        return renderSlot(ctx.slots, "default");
      };
    },
  });
};

export default SerieHoc();
</script>
