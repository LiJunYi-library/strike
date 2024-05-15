import { RResize } from "../resize";
import { defineComponent, reactive, renderSlot, renderList } from "vue";
import "./index.scss";

const RGridProps = {
  columns: { type: Number, default: 1 },
  gap: [Number, String],
  minWidth: Number,
};

export const RGrid = defineComponent({
  props: RGridProps,
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
        <RResize class="r-grid" style={style} onChangeWidth={changeWidth} time={true}>
          {renderSlot(context.slots, "default")}
        </RResize>
      );
    };
  },
});

const RGridListProps = {
  listHook: Object,
  list: Array,
};

export const RGridList = defineComponent({
  props: RGridListProps,
  setup(props, context) {
    return () => {
      const LIST = (props.listHook ? props.listHook.list : props.list) || [];
      return (
        <RGrid {...context.attrs}>
          {renderList(LIST, (item, index) => {
            return context.slots?.default?.({ item, index });
          })}
        </RGrid>
      );
    };
  },
});
