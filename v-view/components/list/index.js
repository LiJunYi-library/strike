import { defineComponent, renderList, renderSlot } from "vue";
import "./index.scss";
import { loadingProps, useLoadingHoc } from "../loading";

export const RListSelectProps = {
  listHook: Object,
  ...loadingProps,
};

export const RListSelect = defineComponent({
  props: RListSelectProps,
  emits: ["change"],
  setup(props, context) {
    const loadConfig = {};
    const loadComs = useLoadingHoc(props, context, loadConfig);
    return (vm) => {
      if (!props.listHook) return null;
      return (
        <div class="r-list-select" ref={(el) => loadComs.setParentHtml(el)}>
          {loadComs.renderContent(
            <div class="r-list-select-win">
              {renderList(props.listHook.list, (item, index) => {
                if (context?.slots?.item) return context?.slots?.item({ index, item });
                return (
                  <div
                    class={[
                      "r-list-item",
                      "r-list-item-store" + props.listHook?.store?.index,
                      props.listHook.same(item) && "r-list-item-same",
                    ]}
                    key={index}
                    onClick={(event) => {
                      if (props.listHook.onSelect(item, index)) return;
                      context.emit("change", item, index);
                    }}
                  >
                    {renderSlot(context.slots, "default", { index, item }, () => [
                      <div> {props.listHook.formatterLabel(item)} </div>,
                    ])}
                  </div>
                );
              })}
            </div>
          )}
          {loadComs.renderError()}
          {loadComs.renderBegin()}
          {loadComs.renderLoading()}
          {loadComs.renderEmpty()}
        </div>
      );
    };
  },
});
