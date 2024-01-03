import { defineComponent, renderSlot, onBeforeUnmount, ref, inject } from "vue";
import { useScrollController } from "./";

export const RScrollFlotage = defineComponent({
  props: {
    top: { type: Number, default: 0 },
    flotageTop: { type: Number, default: 0 },
  },
  setup(props, context) {
    const height = props.top;
    const maxHeight = props.flotageTop;
    const top = ref(height);
    let tY = height;
    let prveTop = 0;
    let isDispatch = true;

    const scrollController = useScrollController({
      onScroll(event, sTop) {
        const { scrollTop, space } = event;
        // console.log("onScroll", event, sTop);
        // const space = sTop - prveTop;
        tY = tY - space;
        if (tY < height) tY = height;
        if (tY > maxHeight) tY = maxHeight;

        event.flotageTop = tY;
        event.flotageHeight = height + tY;
        if (tY === height || tY === maxHeight) {
          if (isDispatch === false) {
            scrollController.dispatchFlotage(event, tY);
            // console.log("dispatch  flotage", tY, event.flotageHeight);
          }
          isDispatch = true;
        }

        if (height < tY && tY < maxHeight) {
          isDispatch = false;
          scrollController.dispatchFlotage(event, tY);
          // console.log("dispatch  flotage", tY, event.flotageHeight);
        }

        prveTop = sTop;
        top.value = tY;
        scrollController.top = top.value;
      },
    });

    return (vm) => {
      return (
        <div
          ref={(el) => {
            scrollController.el = el;
          }}
          style={{
            top: top.value + "px",
          }}
          class="r-scroll-flotage"
        >
          {renderSlot(context.slots, "default")}
        </div>
      );
    };
  },
});
