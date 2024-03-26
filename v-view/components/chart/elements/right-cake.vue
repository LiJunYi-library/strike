<script lang="jsx">
import { chartHoc } from "./index.vue";


function formatter(params = []) {
  // return params.reduce((add, el) => {
  //   console.log(params);
  //   return add + `<div>${el.marker} ${el.seriesName} ${el.value}</div>`;
  // }, "");
  console.log(params);
}

const option = () => ({
  tooltip: {
    trigger: "item",
    // formatter
  },
  legend: {
    orient: "vertical",
    right: "0",
    top: "30",
  },
});

export default chartHoc({
  props: {
    option: { type: Object, default: () => option() },
  },
});
</script>
