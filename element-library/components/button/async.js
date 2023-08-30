import { ElButton, buttonProps } from "element-plus";
import { defineComponent, defineEmits } from "vue";
import { useAsync } from "@rainbow_ljy/v-hooks";

export const AsyncButtonHoc = (config) =>
  defineComponent({
    props: {
      ...buttonProps,
    },
    inheritAttrs: false,
    setup(props, context) {
      // console.log("AsyncButton", context.attrs.onClick);
      const onClick = async (...arg) => undefined;
      const hooks = useAsync(context.attrs.onClick || onClick, config);
      return (VM, _cache) => {
        // console.log("VM", VM);
        return (
          <ElButton {...props} onClick={hooks.invoker} loading={hooks.loading}>
            {{ ...context.slots }}
          </ElButton>
        );
      };
    },
  });

export const AsyncButton = AsyncButtonHoc();
