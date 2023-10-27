import { defineComponent, renderSlot, onBeforeUnmount, ref, inject,com } from "vue";
import { ScrollController, useScrollController } from "./";

export const RScrollSticky = defineComponent({
  props: {
    top: { type: Number, default: 0 },
    changeTop: Number,
  },
  setup(props, context) {
    const top = ref(props.top);
    let tY = 0;
    let prveTop = 0;
    const isChangeTop =  ref(false);

     

    const scrollController = useScrollController({
      onScroll(event, sTop) {
       if(props.changeTop !== undefined )   isChangeTop.value = sTop >= props.changeTop
      },
    });
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
          class={["r-scroll-sticky",isChangeTop.value && "r-scroll-sticky-act"]}
        >
          {renderSlot(context.slots, "default")}
        </div>
      );
    };
  },
});
