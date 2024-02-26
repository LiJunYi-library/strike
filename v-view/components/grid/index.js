import { RResize } from "../resize";
import { defineComponent, reactive, renderSlot } from "vue";
import "./index.scss";

export const RGrid = defineComponent({
  props: {
    columns: { type: Number, default: 1 },
    gap: [Number, String],
    minWidth: Number,
  },
  setup(props, context) {
    function changeWidth(offset) {
      if (!props.minWidth) return;
      const newColumns = Math.floor(offset.width / props.minWidth);
      style["grid-template-columns"] = ` repeat(${newColumns}, 1fr)`;
    }

    const style = reactive({
      "grid-template-columns": ` repeat(${props.columns}, 1fr)`,
      "grid-gap": props.gap + "px",
    });
    return () => {
      return (
        <RResize class="mmb-grid" style={style} onChangeWidth={changeWidth}>
          {renderSlot(context.slots, "default")}
        </RResize>
      );
    };
  },
});
