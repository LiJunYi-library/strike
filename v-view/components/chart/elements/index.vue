<script lang="jsx">
import * as echarts from "echarts";
import {
  onMounted,
  onUpdated,
  watch,
  renderSlot,
  provide,
  reactive,
  defineComponent,
  inject,
} from "vue";
import { RResize } from "../../resize";

/**
 *
 * @param {*} target
 * @param {*} source
 * @param {*} options assignKeys
 * @return target
 */
export function merge(target = {}, source = {}) {
  for (const key in source) {
    if (Object.hasOwnProperty.call(source, key)) {
      const targetEle = target[key];
      const sourceEle = source[key];
      (() => {
        if (!sourceEle) {
          target[key] = sourceEle;
          return;
        }

        if (typeof sourceEle !== "object") {
          target[key] = sourceEle;
          return;
        }

        if (typeof sourceEle === "object" && !targetEle) {
          target[key] = sourceEle;
          return;
        }

        if (typeof targetEle === "object" && typeof sourceEle === "object") {
          merge(targetEle, sourceEle);
        }
      })();
    }
  }
  return target;
}

function formatter(params = []) {
  return params.reduce((add, el) => {
    // console.log(params);
    return add + `<div>${el.marker} ${el.seriesName} ${el.value}</div>`;
  }, "");
}

const defaultOption = () => ({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
    // formatter: formatter,
  },
  title: {
    top: "15",
    left: "0",
  },
  legend: {
    top: "15",
    right: "0",
  },
  grid: {
    left: "0",
    right: "0",
    bottom: "0",
    containLabel: true,
  },
  xAxis: [],
  yAxis: [],
  series: [],
});

export const Hoc = (options = {}) => {
  const config = {
    props: {},
    ...options,
  };
  const defProps = {
    option: { type: Object, default: (...arg) => defaultOption(...arg) },
    listHook: { type: Object, default: () => ({}) },
    options: { type: Object, default: () => ({}) },
    emptyText: { type: String, default: "暂无数据" },
    width: [String, Number],
    height: [String, Number],
    minHeight: { type: [String, Number], default: "500" },
    title: String,
    ...config.props,
  };

  const Context = defineComponent({
    props: defProps,
    setup(props) {
      const ChartContext = inject("ChartContext") || {};

      const chartOptions = {
        title: {
          text: props.title,
        },
      };

      merge(props.option, chartOptions);
      merge(props.option, props.options);

      let chartHeml;
      let chart;

      watch(() => props.listHook.list, updateOption);

      watch(
        () => props.listHook.loading,
        (val) => {
          if (val) chart?.showLoading();
          if (!val) chart?.hideLoading();
        }
      );

      function updateOption() {
        habdlerXAxis();
        habdlerYAxis();
        habdlerSeries();
        setOption();
      }

      onUpdated(() => {
        updateOption();
      });

      function habdlerXAxis() {
        const optionXAxis = ChartContext.xAxis.map((el, index) => {
          const data = props.listHook.list.map((row) => {
            if (el.props.formatter) return el.props.formatter({ row });
            const val = row[el.props.property];
            return val;
          });
          const config = { ...el.attrs };
          if (el?.context?.data?.length) config.data = el?.context?.data;
          if (el?.props?.property || el?.props?.formatter) config.data = data;
          return config;
        });
        // eslint-disable-next-line
        props.option.xAxis = optionXAxis;
        // console.log(props.option.yAxis);
      }

      function habdlerYAxis() {
        const optionYAxis = ChartContext.yAxis.map((el, index) => {
          const data = props.listHook.list.map((row) => {
            if (el.props.formatter) return el.props.formatter({ row });
            const val = row[el.props.property];
            return val;
          });
          const config = { ...el.attrs };
          if (el?.props?.property || el?.props?.formatter) config.data = data;
          return config;
        });
        // eslint-disable-next-line
        props.option.yAxis = optionYAxis;
        // console.log(props.option.yAxis);
      }

      function habdlerSeries() {
        const optionSerie = ChartContext.series.map((el, index) => {
          const data = props.listHook.list.map((row, index) => {
            if (el.props.formatter) return el.props.formatter({ row, index });
            const val = row[el.props.property];
            return val;
          });
          const config = { ...el.attrs };
          if (el?.context?.data?.length) config.data = el?.context?.data?.map((ct) => ct.attrs);
          if (el?.props?.property || el?.props?.formatter) config.data = data;
          if (el.props.name !== undefined) config.name = el.props.name;
          if (el.props.data !== undefined) config.data = el.props.data;
          // console.log(el.props);
          return config;
        });
        // eslint-disable-next-line
        props.option.series = optionSerie;
        // console.log(props.option.series);
      }

      function onResize(offset) {
        chart.resize({ width: offset.width, height: offset.height });
      }

      function setOption() {
        // console.log(props.option);
        if (props.option) chart?.setOption?.(props.option);
      }

      function Mounted() {
        if (!chartHeml.$el) return;
        chart = echarts.init(chartHeml.$el);
        if (!chartHeml.$el.offsetWidth) return;
        updateOption();
      }

      onMounted(Mounted);

      function emptyShow() {
        if (props.listHook.loading === true) return false;
        if (!props.listHook.list) return true;
        if (!props.listHook.list.length) return true;
        return false;
      }

      return () => {
        return (
          <div
            class="chart"
            style={{
              width: props.width + "px",
              height: props.height + "px",
              minHeight: props.minHeight + "px",
            }}
          >
            {emptyShow() && (
              <div class="chart-empty">
                {renderSlot(ChartContext.slots, "empty", {}, () => [<div>{props.emptyText}</div>])}
              </div>
            )}

            <RResize
              ref={(el) => {
                chartHeml = el;
              }}
              class="chart-resize"
              onResize={onResize}
            />
          </div>
        );
      };
    },
  });

  return defineComponent({
    props: defProps,
    setup(props, ctx) {
      const ChartContext = reactive({
        context: ctx,
        slots: ctx.slots,
        attrs: ctx.attrs,
        children: [],
        element: null,
        series: [],
        yAxis: [],
        xAxis: [],
      });
      provide("ChartContext", ChartContext);

      return () => {
        return [renderSlot(ctx.slots, "default"), <Context {...ctx.attrs} {...props}></Context>];
      };
    },
  });
};

const Echarts = Hoc();

export default Echarts;
</script>

<style lang="scss">
.chart {
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  .chart-empty {
    position: absolute;
    z-index: 20;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background: rgb(255, 255, 255);
  }

  .chart-resize {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
}
</style>
