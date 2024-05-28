import { defineComponent, renderSlot, onBeforeUnmount, ref, inject, onMounted } from "vue";

export const RScrollAbsoute = defineComponent({
  props: {
    zIndex: [Number, String],
    top: Number,
    bottom: Number,
    changeTop: Number, // r-scroll-sticky-act 的高度
    fluctuate: { type: Number, default: 1 }, // 波动范围
  },
  setup(props, context) {
    
    return ()=>{
      return null;
    }
  },
});
