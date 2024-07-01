<script lang="jsx">
import { Hoc } from "./index.vue";

const option = () => ({
  tooltip: {
    trigger: "item",
  },
  legend: {
    top: "30",
  },
});

export default Hoc({
  props: {
    option: { type: Object, default: () => option() },
  },
});
</script>
