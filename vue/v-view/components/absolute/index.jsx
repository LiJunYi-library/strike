import { defineComponent, computed } from "vue";
import './index.scss';

export const RAbsolute = defineComponent({
  props: {
    center: [Boolean, String],
    left: [Number, String],
    right: [Number, String],
    bottom: [Number, String],
    top: [Number, String],
  },
  setup(props, context) {

    function px(num) {
      if (num === undefined) return '';
      if (typeof num === 'number') return num + 'px';
      if (!num.includes('px')) return num;
    }

    const className = computed(() => {
      if (!props.center) return ''
      if (props.center === true) return 'r-absolute-center';
      return 'r-absolute-' + props.center;
    })

    return (vm) => {
      return <div class={['r-absolute', className.value]} style={{
        left: px(props.left),
        right: px(props.right),
        top: px(props.top),
        bottom: px(props.bottom),
      }}>{context.slots?.default?.()}</div>;
    };
  },
});
