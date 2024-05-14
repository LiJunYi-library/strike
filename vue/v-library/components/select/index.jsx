import { ElSelect } from "element-plus";
import { defineComponent, renderList, renderSlot } from "vue";
import "./index.scss";

const SelectHoc = (options = {}) => {
  const config = {
    props: {},
    emits: [],
    className: "",
    renderStart: (props) => props.label && <div class="lib-select-label">{props.label}</div>,
    ...options,
  };

  return defineComponent({
    inheritAttrs: false,
    props: {
      label: String,
      ...ElSelect.props,
      listHook: Object,
      stretch: Boolean,
      ...config.props,
    },
    emits: [...config.emits],
    setup(props, context) {
      return (vm) => {
        return (
          <div class={["lib-select", props.stretch && "lib-select-stretch", config.className]}>
            {renderSlot(context.slots, "start", {}, () =>
              [config.renderStart(props)].filter(Boolean),
            )}
            <ElSelect
              {...props}
              {...context.attrs}
              multiple={props.listHook.isMultiple}
              loading={props.listHook.loading}
              modelValue={props.listHook.value}
              onUpdate:modelValue={(val) => props.listHook.updateValue(val)}
            >
              {context?.slots?.content?.(props.listHook) ??
                renderList(props.listHook.list, (item, index) => {
                  return (
                    <ElSelect.Option
                      key={props.listHook.formatterValue(item)}
                      disabled={props.listHook.formatterDisabled(item)}
                      label={props.listHook.formatterLabel(item)}
                      value={props.listHook.formatterValue(item)}
                    >
                      {renderSlot(context.slots, "default", { item, index })}
                    </ElSelect.Option>
                  );
                })}
            </ElSelect>
          </div>
        );
      };
    },
  });
};

const Select = SelectHoc();

export { Select, SelectHoc };
