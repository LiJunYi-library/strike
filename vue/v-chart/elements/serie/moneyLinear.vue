<script lang="jsx">
import { SerieHoc } from "./index.vue";
import * as echarts from "echarts";

const option = () => ({
  type: "line",
  barMaxWidth: 30,
  name: "销售额",
  itemStyle: {
    color: "#00E1C6",
  },
  areaStyle: {
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: "#00E1C6" + "80",
      },
      {
        offset: 1,
        color: "#00E1C6" + "00",
      },
    ]),
  },
});

export default SerieHoc({
  props: {
    property: { type: String, default: "saleMoney" },
    option: { type: Object, default: () => option() },
  },
});
</script>
