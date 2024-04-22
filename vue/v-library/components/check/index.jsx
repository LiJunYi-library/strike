import { ElCheckbox, ElCheckboxGroup, ElCheckboxButton } from "element-plus";
import { defineComponent, renderList, renderSlot } from "vue";
import "./index.scss";

const CheckHoc = (options = {}) => {
  const config = {
    props: {},
    emits: [],
    compunt: ElCheckbox,
    className: "",
    renderStart: (props) => props.label && <div class="lib-check-label">{props.label}</div>,
    ...options,
  };
  return defineComponent({
    inheritAttrs: false,
    props: {
      label: String,
      border: Boolean,
      listHook: Object,
      nowrap: Boolean,
      className: String,
      ...config.props,
    },
    emits: [...config.emits],
    setup(props, context) {
      // eslint-disable-next-line
      const { listHook } = props;

      function renderContent() {
        if (listHook?.begin === false && listHook?.loading === false && !listHook.list.length) {
          return renderSlot(context.slots, "empty");
        }
        return (
          <ElCheckboxGroup
            {...context.attrs}
            inheritAttrs={false}
            loading={listHook.loading}
            modelValue={listHook.value}
            onUpdate:modelValue={(val) => listHook.updateValue(val)}
          >
            {context?.slots?.content?.(listHook) ??
              renderList(listHook.list, (item, index) => {
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
          </ElCheckboxGroup>
        );
      }
      return (vm) => {
        return (
          <div
            class={[
              "lib-check",
              config.className,
              props.className,
              props.nowrap && "lib-check-nowrap",
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

const Check = CheckHoc();

const CheckButton = CheckHoc({ compunt: ElCheckboxButton });

export { Check, CheckButton, CheckHoc };
