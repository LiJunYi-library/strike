import { defineComponent, renderSlot, onBeforeUnmount, ref, inject, com } from "vue";
import { useScrollController } from "./";

export const RScrollFixed = defineComponent({
  props: {
    zIndex: [Number, String],
    top: { type: Number, default: 0 },
    changeTop: Number,
    opacityFun: Function,
    opacityInversion: Boolean,
    opacityTop: Number,
  },
  setup(props, context) {
    const top = ref(props.top);
    const isChangeTop = ref(false);
    const scrollTop = ref(0);

    const scrollController = useScrollController({
      onScroll(event, sTop) {
        scrollTop.value = sTop;
        if (props.changeTop !== undefined) isChangeTop.value = sTop >= props.changeTop;
      },
    });

    function getOpacity() {
      if (props.opacityFun) return props?.opacityFun?.(scrollTop.value);
      if (props.opacityTop === undefined) return 1;
      let o = scrollTop.value / props.opacityTop;
      if (props.opacityInversion) return 1 - o;
      return o;
    }

    return (vm) => {
      return (
        <div
          style={{
            zIndex: props.zIndex,
            top: top.value + "px",
            opacity: getOpacity(),
          }}
          class={["r-scroll-fixed", isChangeTop.value && "r-scroll-fixed-act"]}
        >
          {renderSlot(context.slots, "default", { scrollTop: scrollTop.value })}
        </div>
      );
    };
  },
});
