import { defineComponent, renderList, renderSlot } from "vue";
import "./index.scss";
import { loadingProps, useLoadingHoc } from "../loading";

export const RListSelectProps = {
  listHook: Object,
  ...loadingProps,
};

export const RListSelect = defineComponent({
  props: RListSelectProps,
  setup(props, context) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const { listHook } = props;
    const loadConfig = {};
    const loadComs = useLoadingHoc(listHook, props, context, loadConfig);

    return (vm) => {
      return (
        <div class="r-list-select" ref={(el) => loadComs.setParentHtml(el)}>
          {loadComs.renderContent(
            <div class="r-list-select-win">
              {renderList(listHook.list, (item, index) => {
                if (context?.slots?.item) return context?.slots?.item({ index, item });
                return (
                  <div
                    class={["r-list-item", listHook.same(item) && "r-list-item-same"]}
                    key={index}
                    onClick={(event) => {
                      if (listHook.onSelect(item, index)) return;
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
