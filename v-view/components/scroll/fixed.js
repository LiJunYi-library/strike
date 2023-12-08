import { defineComponent, renderSlot, onBeforeUnmount, ref, inject, com } from "vue";
import { useScrollController } from "./";

export const RScrollFixed = defineComponent({
  props: {
    top: { type: Number, default: 0 },
    changeTop: Number,
    opacityFun: Function,
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

    onBeforeUnmount(() => {
      scrollController.destroy();
    });

    return (vm) => {
      return (
        <div
          style={{
            top: top.value + "px",
            opacity: props?.opacityFun?.(scrollTop.value),
          }}
          class={["r-scroll-fixed", isChangeTop.value && "r-scroll-fixed-act"]}
        >
          {renderSlot(context.slots, "default", { scrollTop: scrollTop.value })}
        </div>
      );
    };
  },
});
