import { defineComponent, renderSlot, onBeforeUnmount, ref, inject } from "vue";
import { ScrollController, useScrollController } from "./";

export const RScrollSticky = defineComponent({
  props: {
    top: { type: Number, default: 0 },
  },
  setup(props, context) {
    const top = ref(props.top);
    let tY = 0;
    let prveTop = 0;

    const scrollController = useScrollController();
    // scrollController.onFlotage = (event, fTop) => {
    //   const { flotageHeight } = event;
    //   // console.log("---------onFlotage", event);
    //   top.value = flotageHeight;
    // };

    onBeforeUnmount(() => {
      scrollController.destroy();
    });

    return (vm) => {
      return (
        <div
          style={{
            top: top.value + "px",
          }}
          class="r-scroll-sticky"
        >
          {renderSlot(context.slots, "default")}
        </div>
      );
    };
  },
});
