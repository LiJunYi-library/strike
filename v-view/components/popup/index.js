import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  watch,
  onMounted,
  ref,
  render,
  nextTick,
  withMemo,
  isMemoSame,
} from "vue";

import { RILoading } from "../icon";

import "./index.scss";

export const RPopup = defineComponent({
  props: {
    loadingHook: {
      type: Object,
      default: () => ({}),
    },
    skelectonCount: {
      type: Number,
      default: 10,
    },
    loadingClass: String,
    skelectonClass: String,
    visible: Object,
  },
  setup(props, context) {
    return () => {
      return (
        <div class={["r-popup"]}>
          <div class={["r-popup-content"]}>{renderSlot(context.slots, "default")}</div>
        </div>
      );
    };
  },
});
