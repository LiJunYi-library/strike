<script lang="jsx">
import { SerieHoc } from "./index.vue";
import * as echarts from "echarts";

const option = () => ({
  name: "价格带分析",
  data: [],
  type: "scatter",
  symbolSize(data) {
    let size = Math.log(data[2]) * 1.5;
    return size;
  },
  markLine: {
    silent: true,
    lineStyle: {
      normal: {
        color: "#01fef9",
      },
    },
    data: [
      {
        yAxis: 0,
      },
      {
        xAxis: 0,
      },
    ],
    label: {
      formatter: () => "均值",
    },
  },
  emphasis: {
    focus: "series",
  },
  itemStyle: {
    shadowBlur: 10,
    shadowColor: "rgba(120, 36, 50, 0.5)",
    shadowOffsetY: 5,
    color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
      {
        offset: 0,
        color: "rgb(251, 118, 123)",
      },
      {
        offset: 1,
        color: "rgb(204, 46, 72)",
      },
    ]),
  },
});

export default SerieHoc({
  props: {
    option: { type: Object, default: () => option() },
  },
});
</script>
