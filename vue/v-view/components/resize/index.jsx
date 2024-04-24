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
  props: {
    name: { type: String, default: "" },
    time: { type: [Number, Boolean], default: false },
  },
  setup(props, context) {
    let html;
    let offset = {};
    useResizeObserver(
      () => html,
      (...arg) => {
        const oldOffset = { ...offset };
        offset = html.getBoundingClientRect();
        if (props.name) {
          document.body.style.setProperty(`--${props.name}Width`, `${offset.width}px`);
          document.body.style.setProperty(`--${props.name}Height`, `${offset.height}px`);
        }
        context.emit("resize", offset, ...arg);
        if (oldOffset.width !== offset.width) context.emit("changeWidth", offset, ...arg);
        if (oldOffset.height !== offset.height) context.emit("changeHeight", offset, ...arg);
      },
      props.time
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
