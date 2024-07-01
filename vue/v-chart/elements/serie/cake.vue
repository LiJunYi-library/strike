<script lang="jsx">
import { onBeforeUnmount, inject, defineComponent } from "vue";
import { SerieHoc } from "./index.vue";

const option = () => ({
  name: "Access From",
  type: "pie",
  radius: "80%",
  top: 100,
  data: [
    { value: 1048, name: "Search Engine" },
    { value: 735, name: "Direct" },
    { value: 580, name: "Email" },
    { value: 484, name: "Union Ads" },
    { value: 300, name: "Video Ads" },
  ],
  emphasis: {
    itemStyle: {
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowColor: "rgba(0, 0, 0, 0.5)",
    },
  },
});

export default SerieHoc({
  props: {
    option: { type: Object, default: () => option() },
  },
});
</script>
