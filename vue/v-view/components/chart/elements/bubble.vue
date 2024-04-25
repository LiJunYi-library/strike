<script lang="jsx">
import { Hoc } from "./index.vue";

const option = () => ({
  title: {
    text: "横轴：成交金额占比  纵轴：成交金额同比",
    left: "40%",
    bottom: "5",
    textStyle: {
      fontSize: 15,
      color: "#666",
    },
  },
  tooltip: {
    trigger: "axis",
    confine: true,
    extraCssText: "white-space: normal; word-break: break-all;width:200px",
    formatter(params) {
      let result = "";
      params?.[0]?.data?.value?.[3]?.forEach?.(function (item) {
        result += `${item}</br>`;
      });
      return result;
    },
  },
  legend: {
    right: "15%",
    top: "3%",
    data: ["价格带分析"],
  },
  grid: {
    right: "50",
    left: "50",
    top: "50",
    bottom: "40",
  },
});

export default Hoc({
  props: {
    option: { type: Object, default: () => option() },
  },
});
</script>
