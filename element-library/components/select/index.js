import { ElSelect } from "element-plus";
import { defineComponent, renderList, renderSlot } from "vue";

const Select = defineComponent({
  props: {
    ...ElSelect.props,
    listHook: Object,
  },
  setup(props, context) {
    // eslint-disable-next-line
    const { listHook } = props;
    // console.log("listHook.isMultiple", listHook.isMultiple);
    return (vm) => {
      return (
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
      );
    };
  },
});

export { Select };
