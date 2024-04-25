<script lang="jsx">
import { XaxiHoc } from "./index.vue";

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
});

export default XaxiHoc({
  props: {
    option: { type: Object, default: () => option() },
  },
});
</script>
