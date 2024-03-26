<script lang="jsx">
import { SerieHoc } from "./index.vue";
import * as echarts from "echarts";

const option = () => ({
  type: "line",
  barMaxWidth: 30,
  name: "销量",
  itemStyle: {
    color: "#005BCA",
  },
  areaStyle: {
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: "#005BCA" + "80",
      },
      {
        offset: 1,
        color: "#005BCA" + "00",
      },
    ]),
  },
});

export default SerieHoc({
  props: {
    property: { type: String, default: "saleCount" },
    option: { type: Object, default: () => option() },
  },
});
</script>
