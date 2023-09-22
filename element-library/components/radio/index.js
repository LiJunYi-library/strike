import { ElRadioGroup, ElRadio, RadioProps, ElRadioButton } from "element-plus";
import { defineComponent, renderList, renderSlot } from "vue";
import "./index.scss";

const RadioHoc = (options = {}) => {
  const config = {
    props: {},
    emits: [],
    compunt: ElRadio,
    className: "",
    renderStart: (props) => props.label && <div class="lib-radio-label">{props.label}</div>,
    ...options,
  };
  return defineComponent({
    inheritAttrs: false,
    props: {
      label: String,
      radioType: { type: String, default: "ElRadio" },
      border: Boolean,
      ...RadioProps,
      listHook: Object,
      nowrap: Boolean,
      className: String,
      ...config.props,
    },
    emits: [...config.emits],
    setup(props, context) {
      // eslint-disable-next-line
      const { listHook } = props;
      // console.log("listHook.isMultiple", listHook.isMultiple);
      ElRadioGroup.inheritAttrs = false;
      function renderContent() {
        if (listHook?.begin === false && listHook?.loading === false && !listHook.list.length) {
          return renderSlot(context.slots, "empty");
        }
        return (
          <ElRadioGroup
            {...props}
            {...context.attrs}
            loading={listHook.loading}
            modelValue={listHook.value}
            onUpdate:modelValue={(val) => listHook.updateValue(val)}
          >
            {renderList(listHook.list, (item, index) => {
              return (
                <config.compunt
                  border={props.border}
                  key={index}
                  disabled={listHook.formatterDisabled(item)}
                  label={listHook.formatterValue(item)}
                >
                  {renderSlot(context.slots, "default", { item, index }, () => [
                    listHook.formatterLabel(item),
                  ])}
                </config.compunt>
              );
            })}
          </ElRadioGroup>
        );
      }
      return (vm) => {
        return (
          <div
            class={[
              "lib-radio",
              config.className,
              props.className,
              props.nowrap && "lib-radio-nowrap",
            ]}
          >
            {renderSlot(context.slots, "start", {}, () =>
              [config.renderStart(props)].filter(Boolean)
            )}
            {renderContent()}
          </div>
        );
      };
    },
  });
};

const Radio = RadioHoc();

const RadioButton = RadioHoc({ compunt: ElRadioButton });

export { Radio, RadioButton, RadioHoc };
