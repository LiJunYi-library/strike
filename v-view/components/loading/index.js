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

import { RILoading } from "../icon";

import "./index.scss";

export const RLoading = defineComponent({
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
    slots: Object,
  },
  setup(props, context) {
    return () => {
      const SLOTS = props.slots || context.slots;
      if (props.loadingHook.begin === true) {
        return (
          <div class={["r-loading", props.loadingClass]}>
            {props.skelectonCount
              ? renderList(props.skelectonCount, (item, index) => {
                  return (
                    <div key={index} class="r-loading-skelecton-item">
                      {renderSlot(SLOTS, "skelecton", props.loadingHook, () => [
                        <RILoading />,
                      ])}
                    </div>
                  );
                })
              : renderSlot(SLOTS, "loading", props.loadingHook, () => [<RILoading />])}
          </div>
        );
      }
      return renderSlot(context.slots, "default");
    };
  },
});
