import { defineComponent, renderSlot, onBeforeUnmount, ref, inject, computed } from "vue";
import { useScrollController } from "../index";
import './index.scss';

export const RScrollFixed = defineComponent({
  props: {
    zIndex: [Number, String],
    top: { type: Number, default: 0 },
    changeTop: Number,
    opacityFun: Function,
    opacityInversion: Boolean,
    opacityTop: [Number, Array],
    visibleTop: Number,
    visibleInversion: Boolean,
  },
  setup(props, context) {
    const top = ref(props.top);
    const isChangeTop = ref(false);
    const scrollTop = ref(0);
    const displayClass = computed(() => {
      if (props.visibleTop === undefined) return '';
      if (props.visibleInversion) {
        if (scrollTop.value >= props.visibleTop) return 'r-scroll-fixed-hide';
        return 'r-scroll-fixed-show';
      }
      if (scrollTop.value >= props.visibleTop) return 'r-scroll-fixed-show';
      return 'r-scroll-fixed-hide';
    })


    function layout(sTop) {
      scrollTop.value = sTop;
      if (props.changeTop !== undefined) isChangeTop.value = sTop >= props.changeTop;
    }

    const scrollController = useScrollController({
      onScroll(event, sTop) {
        layout(sTop);
      },
      onResize(event, sTop) {
        layout(sTop);
      },
    });

    function getOpacity() {
      if (props.opacityFun) return props?.opacityFun?.(scrollTop.value);
      if (props.opacityTop === undefined) return 1;
      if (!(props.opacityTop instanceof Array)) {
        let o = scrollTop.value / props.opacityTop;
        if (o > 1) o = 1;
        if (props.opacityInversion) return 1 - o;
        return o;
      }

      const [start, end] = props.opacityTop;
      let o = (scrollTop.value - start) / end;
      if (o < 0) o = 0;
      if (o > 1) o = 1;
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
          class={["r-scroll-fixed", displayClass.value, isChangeTop.value && "r-scroll-fixed-act"]}
        >
          {renderSlot(context.slots, "default", {
            scrollTop: scrollTop.value,
            isChangeTop: isChangeTop.value,
          })}
        </div>
      );
    };
  },
});
