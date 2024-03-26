<script lang="jsx">
import { SerieHoc } from "./index.vue";

const option = () => ({
  type: "bar",
  barMaxWidth: 30,
  name: "销量",
  itemStyle: {
    color: "#EE6666",
  },
});

export default SerieHoc({
  props: {
    property: { type: String, default: "saleCount" },
    option: { type: Object, default: () => option() },
  },
});
</script>
