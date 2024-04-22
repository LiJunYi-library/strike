import { ElFormItem, formItemProps } from "element-plus";
import { defineComponent } from "vue";

export function FormItemHoc(options = {}) {
  const config = {
    ...options,
    props: {},
    class: "",
    emits: [],
    inheritAttrs: false,
  };
  return defineComponent({
    props: {
      ...formItemProps,
      regExp: RegExp,
      regExpTrigger: {
        type: String,
        default: "blur",
      },
      regExpMessage: {
        type: [String, Function],
        default(props) {
          return props.label + "有误";
        },
      },
      requiredTrigger: {
        type: String,
        default: "blur",
      },
      requiredMessage: {
        type: [String, Function],
        default(props) {
          let trigger = "请选择";
          if (props.requiredTrigger === "blur") trigger = "请输入";
          return `${trigger}${props.label}`;
        },
      },
      ...config.props,
    },
    setup(props, context) {
      return (vm) => {
        const message = (m) => {
          if (m instanceof Function) return m();
          return m;
        };

        const regExpRule = {
          trigger: props.regExpTrigger,
          validator: (rule, value, callback) => {
            if (props.regExp.test(value)) callback(new Error(message(props.regExpMessage)));
          },
        };

        const requiredRule = {
          required: props.required,
          trigger: props.requiredTrigger,
          message: message(props.requiredMessage),
        };

        const rules = [
          props.regExp && regExpRule,
          props.required && requiredRule,
          ...(props.rules || []),
        ].filter(Boolean);
        return (
          <ElFormItem {...props} {...context.attrs} rules={rules}>
            {{ ...context.slots }}
          </ElFormItem>
        );
      };
    },
  });
}

export const FormItem = FormItemHoc();
