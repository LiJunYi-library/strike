import {
  AppContext,
  createVNode,
  defineComponent,
  render,
  resolveComponent,
  VNode,
  h,
  ConcreteComponent,
  reactive,
  ref,
  withDirectives,
  onBeforeUnmount,
  nextTick,
  onMounted,
  watch,
} from "vue";
import {
  ElText,
  ElButton,
  ElMessageBox,
  ElDialog,
  dialogProps,
  vLoading,
  ElLoading,
  ElForm,
  ElMessage,
} from "element-plus";
import "./index.scss";
import { objectFilter } from "@rainbow_ljy/rainbow-js";

ElDialog.inheritAttrs = false;

export function DialogHoc(options = {}) {
  const config = {
    props: {},
    class: "",
    emits: [],
    inheritAttrs: false,
    cancelVerify: () => undefined,
    onCancel: async (_arguments) => {
      const { props } = _arguments;
      const verify = await config.cancelVerify(_arguments);
      if (verify) return;
      const res = props?.onCancelClick?.(_arguments);
      _arguments.resolvePromise(res);
    },
    confirmVerify: () => undefined,
    onConfirm: async (_arguments) => {
      const { props } = _arguments;
      const verify = await config.confirmVerify(_arguments);
      if (verify) return;
      const res = props?.onConfirmClick?.(_arguments);
      _arguments.resolvePromise(res);
    },
    renderHeader: (_arguments, ...arg) => {
      const { context } = _arguments;
      return context?.slots?.header?.(_arguments, ...arg);
    },
    renderFooter: (_arguments, ...arg) => {
      const { props, context } = _arguments;
      if (props.hiddenFooter) return null;
      const vNode = context?.slots?.footer?.(_arguments, ...arg);
      if (vNode) return vNode;

      return (
        <div>
          {props.cancelText && (
            <ElButton onClick={() => config.onCancel(_arguments)}>
              {props.cancelText}
            </ElButton>
          )}
          {props.confirmText && (
            <ElButton onClick={() => config.onConfirm(_arguments)}>
              {props.confirmText}
            </ElButton>
          )}
        </div>
      );
    },
    renderDefault: (_arguments, ...arg) => {
      const { context } = _arguments;
      return context?.slots?.default?.(_arguments, ...arg);
    },
    ...options,
  };
  return defineComponent({
    props: {
      hiddenFooter: {
        type: Boolean,
        default: false,
      },
      confirmText: {
        type: String,
        default: "确认",
      },
      onConfirmClick: {
        type: Function,
        default({ close }) {
          close();
        },
      },
      cancelText: {
        type: String,
        default: "取消",
      },
      onCancelClick: {
        type: Function,
        default({ close }) {
          close();
        },
      },
      loading: {
        type: Boolean,
        default: false,
      },
      init: {
        type: Function,
        default() {
          return 0;
        },
      },
      ...dialogProps,
      appendToBody: {
        type: Boolean,
        default: true,
      },
      "destroy-on-close": {
        type: Boolean,
        default: true,
      },
      modelValue: {
        type: Boolean,
        default: true,
      },
      ...config.props,
    },
    inheritAttrs: config.inheritAttrs,
    emits: [...config.emits],
    setup(props, context) {
      const _arguments = { props, context };
      const loading = ref(props.loading);

      let elLoading;
      const serviceLoad = (target) => {
        elLoading = ElLoading.service({
          lock: true,
          target,
          text: "Loading",
        });
      };

      watch(
        () => props.loading,
        (val) => {
          loading.value = val;
        }
      );

      watch(
        () => loading.value,
        (val) => {
          // console.log(_arguments.vm.$refs?.elDialog);
          const body = _arguments.vm.$refs?.elDialog?.dialogContentRef?.$el;
          if (val) serviceLoad(body);
          else elLoading.close();
        }
      );

      _arguments.resolvePromise = (rest, then) => {
        if (rest instanceof Promise) {
          loading.value = true;
          rest
            .then((res) => {
              if (then) then(res);
            })
            .finally(() => {
              loading.value = false;
            });
        }
        return rest;
      };

      const onOpened = async () => {
        loading.value = props.loading;
        const rest = props.init(_arguments);
        _arguments.resolvePromise(rest);
      };

      return (vm) => {
        _arguments.vm = vm;

        _arguments.close = () => {
          const d = vm?.$refs?.elDialog;
          d.visible = false;
        };

        return (
          <ElDialog
            class={"lib-dialog"}
            {...props}
            {...context.attrs}
            ref={"elDialog"}
            onOpened={onOpened}
          >
            {{
              header: (...arg) => {
                return config?.renderHeader?.(_arguments, ...arg);
              },
              default: (...arg) => {
                return config?.renderDefault?.(_arguments, ...arg);
              },
              footer: (...arg) => {
                return config?.renderFooter?.(_arguments, ...arg);
              },
            }}
          </ElDialog>
        );
      };
    },
  });
}

export const Dialog = DialogHoc({});

{
  /* <el-form
ref="ruleFormRef"
:model="ruleForm"
:rules="rules"
label-width="120px"
class="demo-ruleForm"
:size="formSize"
status-icon
> */
}

export const FormDialogHoc = (options = {}) => {
  const config = {
    async confirmVerify(_arguments) {
      const { vm } = _arguments;
      const res = await vm.$refs.elForm
        .validate()
        .then(() => {
          return false;
        })
        .catch((error) => {
          // console.log(error);
          let messages = [];
          for (const key in error) {
            if (Object.hasOwnProperty.call(error, key)) {
              const err = error[key];
              messages = messages.concat(err.map((el) => el.message));
            }
          }
          ElMessage({
            type: "error",
            message: h(
              "div",
              {
                style: {
                  color: "red",
                },
              },
              messages.map((msg) => h("div", msg))
            ),
          });
          // console.log(messages);
          return true;
        });
      // console.log(res);
      return res;
    },
    renderContent(_arguments, ...arg) {
      const { context } = _arguments;
      return context?.slots?.default?.(_arguments, ...arg);
    },
    renderDefault(_arguments, ...arg) {
      const { context } = _arguments;
      const formAttrs = objectFilter(context.attrs, /form_/g);
      return (
        <ElForm status-icon {...formAttrs} ref="elForm">
          {config.renderContent(_arguments, ...arg)}
        </ElForm>
      );
    },
    ...options,
  };
  return DialogHoc(config);
};

export const FormDialog = FormDialogHoc();

export const renderDialog = (node) => {
  // eslint-disable-next-line
  const div = document.createElement("div");
  if (node instanceof Function) {
    return new Promise((resolve, reject) => {
      node(resolve, reject);
    });
  }
  return render(node, div);
};
