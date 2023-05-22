<script>
export default {
  props: {
    source: [Object],
    eventName: String,
    renderName: String,
  },
  created() {
    if (this.source && this.eventName) {
      // eslint-disable-next-line
      this.source[this.eventName] = this.updataContent;
    }
  },
  methods: {
    updataContent() {
      this.$forceUpdate();
    },
  },
  render() {
    if (this.renderName && this.source) {
      return this.source[this.renderName]();
    }
    return this._t("default");
  },
};
</script>
