<script lang="jsx">
import { YaxiHoc } from "./index.vue";

const option = () => ({
  splitLine: {
    lineStyle: {
      type: "dashed",
    },
  },
  axisLabel: {
    color: "rgba(95,112,132,1)",
    fontSize: "12",
    formatter(value) {
      return `${value.toFixed(2)}%`;
    },
  },
  scale: true,
});

export default YaxiHoc({
  props: {
    option: { type: Object, default: () => option() },
  },
});
</script>
