import { defineComponent, renderSlot, reactive } from "vue";
import { RResize } from '../resize'

export const RAspectRatio = defineComponent({
  props: {
    aspectRatio: [Number], // width/height
    variable: { type: String, default: 'width' },//'width height'
  },
  setup(props, context) {
    const style = reactive({});

    function onResize(offset) {
      if (props.variable === 'width') style.width = `${offset.height * props.aspectRatio}px`;
      if (props.variable === 'height') style.height = `${offset.width / props.aspectRatio}px`;
    }

    return (vm) => {
      return <RResize style={style} onResize={onResize}>{renderSlot(context.slots, "default")}</RResize>;
    };
  },
});
