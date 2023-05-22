export default {
  data() {
    return {
      offset: {},
    };
  },
  props: {
    dom: [Object, null],
  },
  mounted() {
    if (!this.$el) return;
    if (this.$el instanceof Text) return;
    this.$emit("update:dom", this.$el);

    this.resizeObserver = new ResizeObserver((...arg) => {
      const oldOffset = { 
        width: this.offset.width,
        height: this.offset.height,
      
      }; // { ...this.offset };
      this.offset = this.$el.getBoundingClientRect();
      this.$emit("resize", this.offset, ...arg);
      
      if (this.onResize) this.onResize(this.offset, ...arg);

      if (oldOffset.width !== this.offset.width) {
        this.$emit("resizeWidth", this.offset, ...arg);
        if (this.onResizeWidth) this.onResizeWidth(this.offset, ...arg);
      }
      if (oldOffset.height !== this.offset.height) {
        this.$emit("resizeHeight", this.offset, ...arg);
        if (this.onResizeHeight) this.onResizeHeight(this.offset, ...arg);
      }
    });
    this.resizeObserver.observe(this.$el);
  },
  beforeUnmount() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  },
};
