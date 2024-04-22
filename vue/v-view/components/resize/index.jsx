import { useResizeObserver } from "@rainbow_ljy/v-hooks";
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
  onBeforeUnmount,
  Teleport,
  Transition,
} from "vue";

export const RResize = defineComponent({
  setup(props, context) {
    let html;
    let offset = {};
    useResizeObserver(
      () => html,
      (...arg) => {
        const oldOffset = { ...offset };
        offset = html.getBoundingClientRect();
        context.emit("resize", offset, ...arg);
        if (oldOffset.width !== offset.width) context.emit("changeWidth", offset, ...arg);
        if (oldOffset.height !== offset.height) context.emit("changeHeight", offset, ...arg);
      }
    );

    return () => {
      return (
        <div
          ref={(el) => {
            html = el;
          }}
        >
          {renderSlot(context.slots, "default")}
        </div>
      );
    };
  },
});
