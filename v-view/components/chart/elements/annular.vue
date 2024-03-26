<script lang="jsx">
import { chartHoc } from "./index.vue";

const option = () => ({
  tooltip: {
    trigger: "item",
  },
  legend: {
    top: "30",
  },
});

export default chartHoc({
  props: {
    option: { type: Object, default: () => option() },
  },
});
</script>
