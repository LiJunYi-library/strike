import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  watch,
  onMounted,
  ref,
  nextTick,
  withMemo,
  isMemoSame,
} from "vue";

export const RILoading = defineComponent({
  props: {
    listHook: Object,
    htmls: Object,
  },
  setup(props, context) {
    return () => {
      return <i class="loading-icon iconfont">&#xe8ef;</i>;
    };
  },
});
