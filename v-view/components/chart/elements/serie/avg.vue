<script lang="jsx">
import { SerieHoc } from "./index.vue";

const option = () => ({
  type: "line",
  name: "均价",
  itemStyle: {
    color: "#5470C6",
  },
});

export default SerieHoc({
  props: {
    property: { type: String, default: "avgPrice" },
    option: { type: Object, default: () => option() },
  },
});
</script>
