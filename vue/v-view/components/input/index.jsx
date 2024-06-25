import { defineComponent, computed } from "vue";
import "./index.scss";

export const RInput = defineComponent({
  props: {
    placeholder: String,
    modelValue: String,
    hook: Object,
  },
  emits: ["update:modelValue", 'focus', 'blur'],
  setup(props, context) {
    let inputRef;
    const val = computed({
      get: () => {
        if (props.hook) return props.hook.value;
        return props.modelValue;
      },
      set: (val) => {
        if (props.hook) return props.hook.value = val;
        context.emit("update:modelValue", val);
      },
    });

    function onFocus(event) {
      props.hook?.unVerification?.();
      context.emit("focus", event);
    }

    function onBlur(event) {
      props.hook?.verification?.();
      context.emit("blur", event);
    }

    const placeholder = computed(() => {
      if (props?.hook?.error) return props?.hook?.errorText;
      return props.placeholder
    })

    return (vm) => {
      return <input
        {...context.attrs}
        ref={(html) => inputRef = html}
        class={['r-input', props?.hook?.error && 'r-input-error']}
        placeholder={placeholder.value}
        onFocus={onFocus}
        onBlur={onBlur}
        v-model={val.value} />;
    };
  },
});
