<template>
  <div style="overflow: hidden;">    
    <slot></slot>
  </div>
</template>

<script>
import resize from "./index";
export default {
  mixins: [resize],
};
</script>
