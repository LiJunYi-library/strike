import { defineComponent, renderSlot, onBeforeUnmount, ref, inject } from "vue";
import { ScrollController } from "./";

export const RScrollFlotage = defineComponent({
  props: {
    top: { type: Number, default: 0 },
    flotageTop: { type: Number, default: 0 },
  },
  setup(props, context) {
    const RScrollContext = inject("RScrollContext") || {};
    const height = props.top;
    const maxHeight = props.flotageTop;
    const top = ref(height);
    let tY = height;
    let prveTop = 0;
    let isDispatch = true;

    const scrollController = new ScrollController({
      onScroll(event, sTop) {
        // console.log("onScroll", event, sTop);
        const space = sTop - prveTop;
        tY = tY - space;
        if (tY < height) tY = height;
        if (tY > maxHeight) tY = maxHeight;

        event.flotageTop = tY;
        event.flotageHeight = height + tY;
        if (tY === height || tY === maxHeight) {
          if (isDispatch === false) scrollController.dispatchFlotage(event, tY);
          isDispatch = true;
        }

        if (height < tY && tY < maxHeight) {
          isDispatch = false;
          scrollController.dispatchFlotage(event, tY);
          // console.log("dispatch  flotage", tY);
        }

        prveTop = sTop;
        top.value = tY;
      },
    });

    onBeforeUnmount(() => {
      scrollController.destroy();
    });

    // onMounted(() => {
    //   RScrollContext.element.addEventListener("scroll", (event) => {
    //     const sTop = RScrollContext.element.scrollTop;
    //     const space = sTop - prveTop;
    //     tY = tY - space;
    //     if (tY < -height) tY = -height;
    //     if (tY > 0) tY = 0;

    //     if (tY === -height || tY === 0) {
    //       if (isDispatch === false) console.log("dispatch 666 flotage", tY);
    //       isDispatch = true;
    //     }

    //     if (-height < tY && tY < 0) {
    //       isDispatch = false;
    //       console.log("dispatch  flotage", tY);
    //     }

    //     prveTop = sTop;
    //     top.value = tY;
    //   });
    // });

    return (vm) => {
      return (
        <div
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
