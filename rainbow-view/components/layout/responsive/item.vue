<script>
import { renderSlot } from 'vue'
export default {
  //   render() {
  //     return null;
  //   },
  render() {
    return <div class="responsive-item">responsive-item</div>;
  },
  data() {
    return {};
  },
  props: {},
  beforeCreate() {
    //
  },
  created() {
    this.parentAddChild();
  },
  beforeUnmount() {
    this.parentRemoveChild();
  },
  updated() {
    if (this.updataTitle) this.updataTitle();
    if (this.updataLabel) this.updataLabel();
    if (this.updataContent) this.updataContent();
  },
  mounted() {
    //
  },

  methods: {
    isHaveContainer() {
      if (!this.$parent || !this.$parent.children) return false;
      if (!(this.$parent.children instanceof Array)) return false;
      return true;
    },
    parentAddChild() {
      if (!this.isHaveContainer()) return;
      this.$parent.children.push(this);
    },
    parentRemoveChild() {
      if (!this.isHaveContainer()) return;
      this.$parent.children = this.$parent.children.filter((el) => el !== this);
    },
    renderContent() {
      return renderSlot(this.$slots, "default", {});
    },
  },
};
</script>
