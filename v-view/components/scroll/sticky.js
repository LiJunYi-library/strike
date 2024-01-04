import { defineComponent, renderSlot, onBeforeUnmount, ref, inject, onMounted } from "vue";
import { ScrollController, useScrollController } from "./";

export const RScrollSticky = defineComponent({
  props: {
    zIndex: [Number, String],
    top: Number,
    bottom: Number,
    changeTop: Number, // r-scroll-sticky-act 的高度
    fluctuate: { type: Number, default: 0 }, // 波动范围
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
        layout(sTop);
      },
    });

    function refHtml(ref) {
      html = ref;
    }

    function layout(sTop) {
      if (props.changeTop !== undefined) isChangeTop.value = sTop >= props.changeTop;
      const value = Math.round(html.offsetTop - sTop);
      isSticky.value =
        value - props.fluctuate <= html.offsetHeight &&
        html.offsetHeight <= value + props.fluctuate;
      unStickyTop.value = value > html.offsetHeight;
      unStickyBottom.value = value < html.offsetHeight;

      // debugger
      // if(value-props.fluctuate<= html.offsetHeight && html.offsetHeight<=value+props.fluctuate ){
      //   console.log( 'RScrollSticky   正在吸顶');
      // }
      // console.log( 'RScrollSticky',value === html.offsetHeight);
    }

    onMounted(() => {
      const sTop = scrollController?.context?.element?.scrollTop ?? 0;
      layout(sTop);
    });

    return (vm) => {
      let positionStyle = {
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
