import { ElForm, ElButton } from "element-plus";
import { defineComponent, provide, reactive, inject, renderSlot } from "vue";
export * from "./item";

export function FormHoc(options = {}) {
  const config = {
    ...options,
    props: {},
    class: "",
    emits: [],
    inheritAttrs: false,
  };
  return defineComponent({
    props: {
      ...config.props,
    },
    setup(props, context) {
      const ELFContext = reactive({
        ref: null,
      });

      provide("elementLibraryForm", ELFContext);

      function getRef(el) {
        Object.assign(ELFContext, el);
      }

      context.expose(ELFContext);

      return (vm) => {
        return (
          <ElForm {...props} {...context.attrs} ref={getRef}>
            {{ ...context.slots }}
          </ElForm>
        );
      };
    },
  });
}

export const Form = FormHoc();

export const FormSubmit = defineComponent({
  props: {
    comType:  { type: String, default: 'button' }, // button
    isValidate: { type: Boolean, default: true },
  },
  setup(props, context) {
    const ELFContext = inject("elementLibraryForm");

    async function onClick() {
      if (props.isValidate) await ELFContext.validate();
      context.emit("submit");
    }

    return () => {
      if (props.comType === "button") {
        return (
          <ElButton {...context.attrs} onClick={onClick}>
            {renderSlot(context.slots, "default")}
          </ElButton>
        );
      }
      return <div onClick={onClick}>{renderSlot(context.slots, "default")}</div>;
    };
  },
});
