import { defineComponent, renderSlot, onBeforeUnmount, ref, inject, com } from "vue";
import { ScrollController, useScrollController } from "./";

export const RScrollFixed = defineComponent({
  props: {
    top: { type: Number, default: 0 },
    changeTop: Number,
  },
  setup(props, context) {
    const top = ref(props.top);
    const isChangeTop = ref(false);

    const scrollController = useScrollController({
      onScroll(event, sTop) {
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
          }}
          class={["r-scroll-fixed", isChangeTop.value && "r-scroll-fixed-act"]}
        >
          {renderSlot(context.slots, "default")}
        </div>
      );
    };
  },
});
