<script lang="jsx">
import { SerieHoc } from "./index.vue";

const option = () => ({
  type: "bar",
  barMaxWidth: 30,
  name: "销售额",
  itemStyle: {
    color: "#FAC858",
  },
});

export default SerieHoc({
  props: {
    property: { type: String, default: "saleMoney" },
    option: { type: Object, default: () => option() },
  },
});
</script>
