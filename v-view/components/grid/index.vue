<template>
  <mmb-resize class="mmb-grid" :style="style" @changeWidth="changeWidth">
    <slot></slot>
  </mmb-resize>
</template>
<script setup>
import { ref, reactive } from "vue";

const props = defineProps({
  columns: Number,
  gap: String,
  minWidth: Number,
});

// eslint-disable-next-line
let columns = props.columns;

function changeWidth(offset) {
  if (!props.minWidth) return;
  const newColumns = Math.floor(offset.width / props.minWidth);
  if (columns === newColumns) return;
  columns = newColumns;
  style["grid-template-columns"] = ` repeat(${columns}, 1fr)`;
}

const style = reactive({
  "grid-template-columns": ` repeat(${columns}, 1fr)`,
  "grid-gap": props.gap,
});
</script>

<style>
.mmb-grid {
  display: grid;
}
</style>
