import { defineComponent, renderSlot, onBeforeUnmount, ref, inject, onMounted } from "vue";
import { useScrollController } from "./";

export const RScrollSticky = defineComponent({
  props: {
    zIndex: [Number, String],
    top: Number,
    bottom: Number,
    changeTop: Number, // r-scroll-sticky-act 的高度
    fluctuate: { type: Number, default: 1 }, // 波动范围
  },
  setup(props, context) {
    let html;
    const top = ref(props.top);
    const isChangeTop = ref(false);
    const isSticky = ref(false);
    const unStickyTop = ref(false);
    const unStickyBottom = ref(false);

    const scrollController = useScrollController({
      type: "sticky",
      onScroll(event, sTop) {
        layoutTop(sTop);
      },
      onResize(event, sTop) {
        layoutTop(sTop);
      },
    });

    function refHtml(ref) {
      html = ref;
    }

    function layoutTop(sTop) {
      if (props.top === undefined) return;
      if (props.changeTop !== undefined) isChangeTop.value = sTop >= props.changeTop;
      const value = html.offsetTop - sTop;
      isSticky.value = value - props.fluctuate <= props.top && props.top <= value + props.fluctuate;
      unStickyTop.value = value - props.fluctuate > props.top;
      unStickyBottom.value = value + props.fluctuate < props.top;
    }

    onMounted(() => {
      const sTop = scrollController?.context?.element?.scrollTop ?? 0;
      layoutTop(sTop);
    });

    return (vm) => {
      const positionStyle = {
        top: `${props.top}px`,
        bottom: `${props.bottom}px`,
      };

      if (props.top === undefined && props.bottom === undefined) positionStyle.top = 0 + "px";

      return (
        <div
          ref={refHtml}
          style={{
            zIndex: props.zIndex,
            ...positionStyle,
          }}
          class={[
            "r-scroll-sticky",
            isSticky.value && "r-scroll-sticky-sticky",
            !isSticky.value && "r-scroll-sticky-un-sticky",
            unStickyTop.value && "r-scroll-sticky-un-sticky-top",
            unStickyBottom.value && "r-scroll-sticky-un-sticky-bottom",
            isChangeTop.value && "r-scroll-sticky-act",
          ]}
        >
          {renderSlot(context.slots, "default", {
            isSticky: isSticky.value,
            unStickyTop: unStickyTop.value,
            unStickyBottom: unStickyBottom.value,
            isChangeTop: isChangeTop.value,
          })}
        </div>
      );
    };
  },
});
