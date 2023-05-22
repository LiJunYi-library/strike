<script>
import { renderSlot } from "vue";
import resizeMixin from "../resize/index";
import Resize from "../resize/index.vue";

export default {
  components: { Resize },
  // mixins: [resizeMixin],
  render() {
    if (this._isInterceptRender()) return null;
    if (this._isInterceptDraw()) {
      return (
        <div class="r-view" style={this.style}>
          <Resize onResize={this._onResize}>{renderSlot(this.$slots, "default", {})}</Resize>
        </div>
      );
    }
    return renderSlot(this.$slots, "default", {});
  },
  data() {
    return {
      children: [],
      updateOptions: {},
      updates: [],
      client: {
        maxHeight: 0,
      },
      measure: {},
      style: {
        position: "absolute",
        width: 0,
        // height:0,
        // left: 0,
        // top: 0,
      },
    };
  },
  watch: {},
  computed: {},
  props: {},
  beforeCreate() {
    //
  },
  created() {
    this._parentAddChild();
  },
  beforeUnmount() {
    this._parentRemoveChild();
  },
  updated() {
    const { updateOptions, updates } = this;
    for (const key in updateOptions) {
      if (Object.hasOwnProperty.call(updateOptions, key)) {
        const fun = updateOptions[key];
        if (fun instanceof Function) fun(this);
      }
    }
    updates.forEach((fun) => {
      if (fun instanceof Function) fun(this);
    });
  },
  mounted() {
    // console.log("view mounted", this);
  },
  methods: {
    _onResize(offset) {
      this.measure = offset;
      if (!this.$parent || !this.$parent.$options || !this.$parent.$options.measureChildren) return;
      this.$parent.$options.measureChildren.call(this.$parent, offset);
    },
    _isInterceptDraw() {
      if (!this.$parent || !this.$parent.$options) return false;
      return this.$parent.$options.interceptDraw;
    },
    _isInterceptRender() {
      if (!this.$parent || !this.$parent.$options) return false;
      return this.$parent.$options.interceptRender;
    },
    _isHaveContainer() {
      if (!this.$parent || !this.$parent.children) return false;
      if (!(this.$parent.children instanceof Array)) return false;
      return true;
    },
    _parentAddChild() {
      if (!this._isHaveContainer()) return;
      this.$parent.children.push(this);
    },
    _parentRemoveChild() {
      if (!this._isHaveContainer()) return;
      this.$parent.children = this.$parent.children.filter((el) => el !== this);
    },
  },
};
</script>

<style>
.r-view {
  background: rgba(102, 0, 255, 0.4);
}
</style>
