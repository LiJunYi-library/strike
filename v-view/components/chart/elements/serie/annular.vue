<script lang="jsx">
import { onBeforeUnmount, inject, defineComponent } from "vue";
import { SerieHoc } from "./index.vue";

const option = () => ({
  top: 20,
  name: "Access From",
  type: "pie",
  radius: ["40%", "70%"],
  avoidLabelOverlap: true,
  itemStyle: {
    borderRadius: 5,
    borderColor: "#fff",
    borderWidth: 2,
  },
  label: {
    show: false,
    position: "center",
  },
  emphasis: {
    label: {
      show: true,
      fontSize: 40,
      fontWeight: "bold",
    },
  },
  labelLine: {
    show: false,
  },
  data: [],
});

export default SerieHoc({
  props: {
    option: { type: Object, default: () => option() },
  },
});
</script>
