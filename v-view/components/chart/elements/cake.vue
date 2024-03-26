<script lang="jsx">
import { chartHoc } from "./index.vue";

const option = () => ({
  title: {
    left: "0",
  },
  tooltip: {
    trigger: "item",
  },
  legend: {
    left: "center",
    top: 26,
  },
});

export default chartHoc({
  props: {
    option: { type: Object, default: () => option() },
  },
});
</script>
