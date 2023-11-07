import { defineComponent, renderList, renderSlot } from "vue";
import "./index.scss";
import { loadingProps, useLoadingHoc } from "../loading";

export const RList = defineComponent({
  props: {
    listHook: Object,
    ...loadingProps,
  },
  setup(props, context) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const { listHook } = props;

    const loadComs = useLoadingHoc(listHook, props, context);

    return (vm) => {
      return (
        <div class="r-list-select">
          <div class="r-list-select-win">
            {renderList(listHook.list, (item, index) => {
              if (context?.slots?.item) return context?.slots?.item({ index, item });
              return (
                <div
                  class={["r-list-item", listHook.same(item) && "r-list-item-same"]}
                  key={index}
                  onClick={(event) => {
                    if (listHook.same(item)) return;
                    listHook.onSelect(item, index);
                    context.emit("change", item, index);
                  }}
                >
                  {renderSlot(context.slots, "default", { index, item }, () => [
                    <div> {listHook.formatterLabel(item)} </div>,
                  ])}
                </div>
              );
            })}
          </div>
          {loadComs.renderError()}
          {/* {loadComs.renderBegin()} */}
          {loadComs.renderLoading()}
          {/* {loadComs.renderfinished()} */}
          {loadComs.renderEmpty()}
        </div>
      );
    };
  },
});
