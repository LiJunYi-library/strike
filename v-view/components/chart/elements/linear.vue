<script lang="jsx">
import { chartHoc } from "./index.vue";

const option = () => ({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  title: {
    top: "15",
    left: "0",
  },
  legend: { bottom: "0", top: "auto", right: "auto" },
  grid: {
    top: "90",
    left: "10",
    right: "10",
    bottom: "30",
    containLabel: true,
  },
  xAxis: [],
  yAxis: [],
  series: [],
});

export default chartHoc({
  props: {
    option: { type: Object, default: () => option() },
  },
});
</script>
