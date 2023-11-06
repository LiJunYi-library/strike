import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  watch,
  onMounted,
  ref,
  render,
  nextTick,
  withMemo,
  isMemoSame,
} from "vue";

import { RILoading } from "../icon";

import "./index.scss";

export const RLoading = defineComponent({
  props: {
    loadingHook: {
      type: Object,
      default: () => ({}),
    },
    skelectonCount: {
      type: Number,
      default: 10,
    },
    loadingClass: String,
    skelectonClass: String,
    slots: Object,
  },
  setup(props, context) {
    return () => {
      const SLOTS = props.slots || context.slots;
      if (props.loadingHook.begin === true) {
        return (
          <div class={["r-loading", props.loadingClass]}>
            {props.skelectonCount
              ? renderList(props.skelectonCount, (item, index) => {
                  return (
                    <div key={index} class="r-loading-skelecton-item">
                      {renderSlot(SLOTS, "skelecton", props.loadingHook, () => [<RILoading />])}
                    </div>
                  );
                })
              : renderSlot(SLOTS, "loading", props.loadingHook, () => [<RILoading />])}
          </div>
        );
      }
      return renderSlot(context.slots, "default");
    };
  },
});

export const RLoadings = defineComponent({
  props: {
    loadingHook: {
      type: [Object, Array],
      default: () => ({}),
    },
    promiseHook: {
      type: [Object, Array],
      default: () => ({}),
    },
    parentHtml: HTMLElement,
  },
  setup(props, context) {
    // eslint-disable-next-line
    const { loadingHook, promiseHook } = props;

    // onMounted(() => {
    //   console.log([props?.parentHtml]);
    //   console.log(props?.parentHtml?.offsetWidth);
    // });

    const isLoading = computed(() => {
      const loadings = [];

      if (promiseHook instanceof Array) loadings.push(...promiseHook);
      else loadings.push(promiseHook);

      if (loadingHook instanceof Array) loadings.push(...loadingHook);
      else loadings.push(loadingHook);

      const load = loadings.some((el) => el?.loading === true);
      return load;
    });

    const isError = computed(() => {
      const errors = [];
      if (promiseHook instanceof Array) errors.push(...promiseHook);
      else errors.push(promiseHook);
      const error = errors.some((el) => el?.error === true);
      return error;
    });

    function setRelative(bool = true) {
      props.parentHtml.setAttribute("data-relative", bool);
    }

    return () => {
      if (isLoading.value) {
        setRelative(true);
        return (
          <div class={["r-loadings"]}>
            <RILoading class="r-loadings-icon" />
            <div class={["r-loadings-text"]}>正在加载中</div>
          </div>
        );
      }

      if (isError.value) {
        setRelative(true);
        return (
          <div class={["r-loadings"]}>
            <div class={["r-loadings-error-text"]}>出错了</div>
          </div>
        );
      }

      setRelative(false);
      return renderSlot(context.slots, "default");
    };
  },
});

export const directiveLoading = {
  install(app, options) {
    app.directive("loadings", {
      created(el, binding, vnode, prevVnode) {
        el.__loadingHook = binding.value;
        // console.log("loadings", [el]);
        render(
          <RLoadings
            key="loadings"
            promiseHook={el.__promiseHook}
            loadingHook={el.__loadingHook}
            parentHtml={el}
          />,
          el
        );
      },
    });
  },
};

export const directivepromise = {
  install(app, options) {
    app.directive("promise", {
      created(el, binding, vnode, prevVnode) {
        el.__promiseHook = binding.value;
        // console.log("promise", [el]);
        render(
          <RLoadings
            key="promise"
            promiseHook={el.__promiseHook}
            loadingHook={el.__loadingHook}
            parentHtml={el}
          />,
          el
        );
      },
    });
  },
};
