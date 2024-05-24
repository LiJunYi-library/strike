import { defineComponent } from "vue";

export const RILoading = defineComponent({
  props: {
    listHook: Object,
    htmls: Object,
  },
  setup(props, context) {
    return () => {
      return <i class="loading-icon iconfont">&#xe607;</i>;
    };
  },
});
