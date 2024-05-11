import { defineComponent, renderSlot, reactive, ref, inject } from "vue";
import { useScrollController } from "./";

export const RScrollFlotage = defineComponent({
  props: {
    zIndex: [Number, String],
    top: { type: Number, default: 0 },
    flotageTop: { type: Number, default: 0 },
    fluctuate: { type: Number, default: 1 }, // 波动范围
  },
  setup(props, context) {
    const height = props.top;
    const maxHeight = props.flotageTop;
    const top = ref(height);
    const isSticky = ref(false);
    const unStickyTop = ref(false);
    const unStickyBottom = ref(false);
    const isFlotage = ref(false);
    const unFlotageTop = ref(false);
    const unFlotageBottom = ref(false);
    let tY = height;
    let prveTop = 0;
    let isDispatch = true;
    let html;

    const scrollController = useScrollController({
      onScroll(event, sTop) {
        const { scrollTop, space } = event;
        tY = tY - space;
        if (tY < height) tY = height;
        if (tY > maxHeight) tY = maxHeight;

        event.flotageTop = tY;
        event.flotageHeight = height + tY;
        if (tY === height || tY === maxHeight) {
          if (isDispatch === false) {
            scrollController.dispatchFlotage(event, tY);
          }
          isDispatch = true;
        }

        if (height < tY && tY < maxHeight) {
          isDispatch = false;
          scrollController.dispatchFlotage(event, tY);
        }

        prveTop = sTop;
        top.value = tY;

        const value = scrollController.getOffsetTop(html) - sTop;
        isSticky.value =
          value - props.fluctuate <= props.top && props.top <= value + props.fluctuate;
        unStickyTop.value = value - props.fluctuate > props.top;
        unStickyBottom.value = value + props.fluctuate < props.top;

        isFlotage.value =
          value - props.fluctuate <= props.flotageTop &&
          props.flotageTop <= value + props.fluctuate;
        unFlotageTop.value = value - props.fluctuate > props.flotageTop;
        unFlotageBottom.value = value + props.fluctuate < props.flotageTop;
      },
    });

    const arg = reactive({
      top,
      isSticky,
      unStickyTop,
      unStickyBottom,
      isFlotage,
      unFlotageTop,
      unFlotageBottom,
    });

    return (vm) => {
      return (
        <div
          ref={(el) => {
            html = el;
          }}
          style={{
            zIndex: props.zIndex,
            top: top.value + "px",
          }}
          class={[
            "r-scroll-flotage",
            isSticky.value && "r-scroll-flotage-sticky",
            !isSticky.value && "r-scroll-flotage-un-sticky",
            unStickyTop.value && "r-scroll-flotage-un-sticky-top",
            unStickyBottom.value && "r-scroll-flotage-un-sticky-bottom",
            isFlotage.value && "r-scroll-flotage-flotage",
            !isFlotage.value && "r-scroll-flotage-un-flotage",
            unFlotageTop.value && "r-scroll-flotage-un-flotage-top",
            unFlotageBottom.value && "r-scroll-flotage-un-flotage-bottom",
          ]}
        >
          {renderSlot(context.slots, "default", arg)}
        </div>
      );
    };
  },
});
