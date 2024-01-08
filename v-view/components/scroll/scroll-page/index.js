import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  reactive,
  onMounted,
  provide,
  inject,
  watch,
  onBeforeUnmount,
  ref,
} from "vue";
import { ScrollController, useScrollController } from "../index";
import "./index.scss";

const props = {
  listHook: Object,
  lazy: Boolean,
  cache: { type: Boolean, default: true },
  width: { type: Number, default: window.innerWidth },
  offsetTop: { type: Number, default: 0 },
  behavior: { type: String, default: "instant" }, // smooth  instant
  isTriggerScroll: Boolean, // 初始触发定位
};

const events = [];
let event;

const Context = defineComponent({
  props,
  setup(props, context) {
    // eslint-disable-next-line
    const { listHook } = props;
    const RScrollPageContext = inject("RScrollPageContext") || {};
    let isTriggerWatch = true;
    let isHandActuated = false;
    let lock = false;

    const scrollController = useScrollController({
      onScroll(event, sTop) {
        // if (lock === true) return; 浏览器版本大于105生效

        if (isHandActuated) {
          isHandActuated = false;
          return;
        }

        RScrollPageContext.children.forEach((ele, index) => {
          const min = ele.html.offsetTop - props.offsetTop;
          const max = ele.html.offsetTop - props.offsetTop + ele.html.offsetHeight;

          if (index === 0 && sTop <= min) {
            if (listHook.index === index) return;
            isTriggerWatch = false;
            listHook.updateIndex(index);
            context.emit("change", index);
          }

          if (sTop > min && sTop < max) {
            if (listHook.index === index) return;
            isTriggerWatch = false;
            listHook.updateIndex(index);
            context.emit("change", index);
          }
        });
      },
      onMounted() {
        if (props.isTriggerScroll) scrollTo();
      },
      onScrollend() {
        lock = false;
      },
    });

    watch(
      () => props.listHook.select,
      () => {
        if (isTriggerWatch === false) {
          isTriggerWatch = true;
          return;
        }
        scrollTo();
      }
    );

    function scrollTo() {
      lock = true;
      isHandActuated = true;
      let currentItem = RScrollPageContext.children[listHook.index];
      let currentHtml = currentItem.html;
      let top = currentHtml.offsetTop - props.offsetTop;

      if (typeof currentItem.props.offsetTop === "number") {
        top = currentHtml.offsetTop - currentItem.props.offsetTop;
      }

      if (typeof currentItem.props.scrollTop === "number") {
        top = currentItem.props.scrollTop;
      }

      scrollController.context.element.scrollTo({ top: top, behavior: props.behavior });
    }

    function renderContent() {
      const isUseHook = !RScrollPageContext?.children?.length;
      const listRenderData = isUseHook ? listHook.list : RScrollPageContext.children;

      const same = (item, index) => {
        if (isUseHook) return listHook.same(item);
        return listHook.index === index;
      };

      return renderList(listRenderData, (item, index) => {
        return (
          <div
            ref={(html) => {
              item.html = html;
            }}
            style={{ width: props.width + "px" }}
            key={index}
            class={["r-scroll-page-item", , same(item, index) && "r-scroll-page-item-same"]}
          >
            {isUseHook
              ? renderSlot(RScrollPageContext.slots, "item", { item, index })
              : renderSlot(item.slots, "default")}
          </div>
        );
      });
    }

    return (vm) => {
      return renderContent();
    };
  },
});

export const RScrollPage = defineComponent({
  props: props,
  setup(props, ctx) {
    const RScrollPageContext = reactive({
      context: ctx,
      slots: ctx.slots,
      attrs: ctx.attrs,
      children: [],
      element: null,
    });

    provide("RScrollPageContext", RScrollPageContext);

    return () => {
      return [renderSlot(ctx.slots, "default"), <Context {...ctx.attrs} {...props}></Context>];
    };
  },
});

export const RScrollPageItem = defineComponent({
  props: {
    scrollTop: Number,
    offsetTop: Number,
  },
  setup(props, context) {
    const RScrollPageContext = inject("RScrollPageContext") || {};

    const item = reactive({
      context: context,
      slots: context.slots,
      attrs: context.attrs,
      html: undefined,
      props,
    });

    RScrollPageContext?.children?.push?.(item);

    onBeforeUnmount(() => {
      RScrollPageContext?.children?.filter?.((el) => el !== item);
    });

    return () => {
      return null;
    };
  },
});
