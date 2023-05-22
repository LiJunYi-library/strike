<script>
import { renderSlot, h } from "vue";

export default {
  interceptRender: true,
  render() {
    return [
      renderSlot(this.$slots, "default", {}),
      h({
        render() {
          if (!this.$parent || !this.$parent.$options || !this.$parent.$options.renderContext) {
            return null;
          }
          return this.$parent.$options.renderContext.call(this.$parent);
        },
      }),
    ];
  },
  renderContext() {
    console.log("Context", this);
    console.log("Context", this.children.length);
    return <div class="responsive">Context</div>;
  },
  data() {
    return { children: [] };
  },
  created() {
    console.log(this.children.length);
  },
};
</script>
