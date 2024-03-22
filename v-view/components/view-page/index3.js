import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  reactive,
  onMounted,
  provide,
  inject,
  cloneVNode,
  onUpdated,
  onBeforeUnmount,
  ref,
  getCurrentInstance,
  Transition,
  KeepAlive,
  queuePostFlushCb,
} from "vue";
import "./index.scss";

import { arrayInvokeFuns, isFunction } from "@rainbow_ljy/rainbow-js";

const props = {
  listHook: Object,
  lazy: Boolean,
  cache: { type: Boolean, default: true },
  width: { type: Number, default: window.innerWidth },
};

const Context = defineComponent({
  props,
  setup(props, context) {
    // eslint-disable-next-line
    const { listHook } = props;
    const RViewPageContext = inject("RViewPageContext") || {};

    const instance = getCurrentInstance();
    const sharedContext = instance.ctx;
    let containerHtml, parentHtml;

    //

    let pendingCacheKey = null;
    let pendingCacheVnode;

    const getTranslateX = () => {
      if (!containerHtml) return 0;
      const width = containerHtml.offsetWidth;
      const nth = listHook.index;
      const x = nth * -width; // 反过来 nth * width - (listHook.list.length - 1) * width
      return x;
    };

    return (vm) => {
      pendingCacheKey = null;
      console.log(listHook.list);
      const items = listHook.list.map((item, index) =>
        RViewPageContext?.slots?.item?.({ item, index })
      );
      console.log(items);
      return (
        <div class={"r-view-page"} ref={(el) => (containerHtml = el)}>
          {/* <Transition name="viewPAge"> */}
          <KeepAlive>{items[listHook.index]}</KeepAlive>
          {/* </Transition> */}
        </div>
      );
    };
  },
});

export const RViewPage3 = defineComponent({
  props: props,
  setup(props, ctx) {
    const RViewPageContext = reactive({
      context: ctx,
      slots: ctx.slots,
      attrs: ctx.attrs,
      children: [],
      element: null,
    });
    provide("RViewPageContext", RViewPageContext);

    return () => {
      const vNode = ctx.slots?.default?.();
      return [vNode, <Context {...ctx.attrs} {...props}></Context>];
    };
  },
});

export const RViewPageItem3 = defineComponent({
  setup(props, context) {
    const RViewPageContext = inject("RViewPageContext") || {};

    const item = reactive({
      context: context,
      slots: context.slots,
      attrs: context.attrs,
    });

    RViewPageContext?.children?.push?.(item);
    onBeforeUnmount(() => {
      RViewPageContext?.children?.filter?.((el) => el !== item);
    });

    return () => {
      return null;
    };
  },
});
