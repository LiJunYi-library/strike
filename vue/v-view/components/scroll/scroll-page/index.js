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
  width: { type: [Number, String], default: '' },
  offsetTop: { type: Number, default: 0 },
  behavior: { type: String, default: "instant" }, // smooth  instant
  isTriggerScroll: Boolean, // 初始触发定位
};

const Context = defineComponent({
  props,
  setup(props, context) {
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
          const min = scrollController.getOffsetTop(ele.html) - props.offsetTop;
          const max =
            scrollController.getOffsetTop(ele.html) - props.offsetTop + ele.html.offsetHeight;

          if (index === 0 && sTop <= min) {
            if (props.listHook.index === index) return;
            isTriggerWatch = false;
            props.listHook.updateIndex(index);
            context.emit("change", index);
          }

          if (sTop > min && sTop < max) {
            if (props.listHook.index === index) return;
            isTriggerWatch = false;
            props.listHook.updateIndex(index);
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
      },
    );

    function scrollTo() {
      const currentItem = RScrollPageContext.children[props.listHook.index];
      if (!currentItem) return;
      const currentHtml = currentItem.html;
      if (!currentHtml) return;
      lock = true;
      isHandActuated = true;
      let top = scrollController.getOffsetTop(currentHtml) - props.offsetTop;

      if (typeof currentItem.props.offsetTop === "number") {
        top = scrollController.getOffsetTop(currentHtml) - currentItem.props.offsetTop;
      }

      if (typeof currentItem.props.scrollTop === "number") {
        top = currentItem.props.scrollTop;
      }

      scrollController.context.element.scrollTo({ top: top, behavior: props.behavior });
    }

    const width = computed(() => {
      if (typeof props.width === "number") return props.width + "px";
      return props.width;
    });

    function renderContent() {
      const isUseHook = !RScrollPageContext?.children?.length;
      const listRenderData = isUseHook ? props.listHook.list : RScrollPageContext.children;

      const same = (item, index) => {
        if (isUseHook) return props.listHook.same(item);
        return props.listHook.index === index;
      };

      return renderList(listRenderData, (item, index) => {
        return (
          <div
            ref={(html) => {
              item.html = html;
            }}
            style={{ width: width.value }}
            key={index}
            class={["r-scroll-page-item", same(item, index) && "r-scroll-page-item-same"]}
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
