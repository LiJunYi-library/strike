import { ElSelect } from "element-plus";
import { defineComponent, renderList, renderSlot } from "vue";
import './index.scss'

const SelectHoc = (options = {}) => {
  const config = {
    props: {},
    emits: [],
    className: "",
    renderStart: (props) => props.lable && <div class="lib-select-lable">{props.lable}</div>,
    ...options,
  };

  return defineComponent({
    inheritAttrs: false,
    props: {
      lable: String,
      ...ElSelect.props,
      listHook: Object,
      ...config.props,
    },
    emits: [...config.emits],
    setup(props, context) {
      // eslint-disable-next-line
      const { listHook } = props;
      // console.log("listHook.isMultiple", listHook.isMultiple);
      return (vm) => {
        return (
          <div class={["lib-select", config.className]}>
            {renderSlot(context.slots, "start", {}, () =>
              [config.renderStart(props)].filter(Boolean)
            )}
            <ElSelect
              {...props}
              {...context.attrs}
              multiple={listHook.isMultiple}
              loading={listHook.loading}
              modelValue={listHook.value}
              onUpdate:modelValue={(val) => listHook.updateValue(val)}
            >
              {renderList(listHook.list, (item, index) => {
                return (
                  <ElSelect.Option
                    key={index}
                    disabled={listHook.formatterDisabled(item)}
                    label={listHook.formatterLabel(item)}
                    value={listHook.formatterValue(item)}
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
