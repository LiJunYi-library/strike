import { defineComponent, renderSlot, onBeforeUnmount, ref, inject, com } from "vue";
import { ScrollController, useScrollController } from "./";

export const RScrollSticky = defineComponent({
  props: {
    zIndex: [Number, String],
    top: { type: Number, default: 0 },
    changeTop: Number,
  },
  setup(props, context) {
    const top = ref(props.top);
    let tY = 0;
    let prveTop = 0;
    const isChangeTop = ref(false);

    const scrollController = useScrollController({
      type: "sticky",
      onScroll(event, sTop) {
        if (props.changeTop !== undefined) isChangeTop.value = sTop >= props.changeTop;
      },
    });

    return (vm) => {
      return (
        <div
          style={{
            zIndex: props.zIndex,
            top: top.value + "px",
          }}
          class={["r-scroll-sticky", isChangeTop.value && "r-scroll-sticky-act"]}
        >
          {renderSlot(context.slots, "default")}
        </div>
      );
    };
  },
});
