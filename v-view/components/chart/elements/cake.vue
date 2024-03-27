<script lang="jsx">
import { Hoc } from "./index.vue";

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

export default Hoc({
  props: {
    option: { type: Object, default: () => option() },
  },
});
</script>
