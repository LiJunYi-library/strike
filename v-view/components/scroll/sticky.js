import { defineComponent, renderSlot, onBeforeUnmount, ref, inject, com } from "vue";
import { ScrollController, useScrollController } from "./";

export const RScrollSticky = defineComponent({
  props: {
    zIndex: [Number, String],
    top: Number,
    bottom: Number,
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
      let positionStyle = {
        top: `${props.top}px`,
        bottom: `${props.bottom}px`,
      };

      if (props.top === undefined && props.bottom === undefined) positionStyle.top = 0 + "px";

      return (
        <div
          style={{
            zIndex: props.zIndex,
            ...positionStyle,
          }}
          class={["r-scroll-sticky", isChangeTop.value && "r-scroll-sticky-act"]}
        >
          {renderSlot(context.slots, "default")}
        </div>
      );
    };
  },
});
