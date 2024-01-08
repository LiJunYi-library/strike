import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  reactive,
  onMounted,
  provide,
  inject,
  onBeforeUnmount,
  watch,
  ref,
} from "vue";
import "./index.scss";

const props = {
  listHook: Object,
  lazy: Boolean,
  cache: { type: Boolean, default: true },
  width: { type: Number, default: window.innerWidth },
  behavior: { type: String, default: "smooth" }, // smooth  instant
};

const Context = defineComponent({
  props,
  setup(props, context) {
    // eslint-disable-next-line
    const { listHook } = props;
    const itemsHtml = [];
    let parentHtml = null;
    let containerHtml = null;
    let prveSLeft = 0;
    let sLeft = 0;
    let lock = false;
    let isTriggerWatch = true;
    const actItemHtml = null;
    const RPageViewContext = inject("RPageViewContext") || {};

    onMounted(() => {});

    watch(
      () => props.listHook.select,
      () => {
        if (isTriggerWatch === false) {
          isTriggerWatch = true;
          return;
        }
        lock = true;
        // console.log("watch");
        scrollTo();
      }
    );

    function scrollTo() {
      let left = props.width * listHook.index;
      containerHtml.scrollTo({ left, behavior: props.behavior });
    }

    function onTouchStart() {
      // console.log("onTouchStart");
    }

    function onScrollend(params) {
      // console.log("onScrollend");
      lock = false;
    }

    function update(index) {
      // console.log("update",lock);
      if (index === listHook.index) return;
      if (lock === true) return;
      isTriggerWatch = false;
      listHook.updateIndex(index);
      context.emit("change", index);
    }

    function onScroll(event) {
      // console.log("onScroll");
      sLeft = containerHtml.scrollLeft;
      let sapce = sLeft - prveSLeft;
      if (sapce < 0) onScrollRight(event, sLeft);
      if (sapce > 0) onScrollLeft(event, sLeft);
      prveSLeft = sLeft;

      let index = Math.round(sLeft) / props.width;
      if (!Number.isInteger(index)) return;
      // console.log(index, listHook.index);
      update(index);
      lock = false;
    }

    function onScrollLeft(event, sLeft) {}

    function onScrollRight(event, sLeft) {}

    function renderContent() {
      const isUseHook = !RPageViewContext?.children?.length;
      const listRenderData = isUseHook ? listHook.list : RPageViewContext.children;
      const same = (item, index) => {
        if (isUseHook) return listHook.same(item);
        return listHook.index === index;
      };

      return renderList(listRenderData, (item, index) => {
        // if (props.lazy) {
        //   if (same(item, index)) item.rViewPageIscache = true;
        //   if (!item.rViewPageIscache) {
        //     return (
        //       <div
        //         style={{ width: props.width + "px" }}
        //         key={index}
        //         ref={(el) => (itemsHtml[index] = el)}
        //         class={["r-page-view-item", same(item, index) && "r-page-view-item-same"]}
        //       ></div>
        //     );
        //   }
        // }

        // if (!props.cache && !same(item, index)) {
        //   return (
        //     <div
        //       style={{ width: props.width + "px" }}
        //       key={index}
        //       ref={(el) => (itemsHtml[index] = el)}
        //       class={["r-page-view-item", same(item, index) && "r-page-view-item-same"]}
        //     ></div>
        //   );
        // }

        return (
          <div
            style={{ width: props.width + "px" }}
            key={index}
            ref={(el) => (itemsHtml[index] = el)}
            class={["r-page-view-item", same(item, index) && "r-page-view-item-same"]}
          >
            {isUseHook
              ? renderSlot(RPageViewContext.slots, "item", { item, index })
              : renderSlot(item.slots, "default")}
          </div>
        );
      });
    }

    return (vm) => {
      return (
        <div
          class={["r-page-view"]}
          ref={(el) => (containerHtml = el)}
          onScroll={onScroll}
          onScrollend={onScrollend}
          onTouchstart={onTouchStart}
        >
          <div
            ref={(el) => (parentHtml = el)}
            class={["r-page-view-list"]}
            style={{
              width: props.width * (listHook?.list?.length ?? 0) + "px",
            }}
          >
            {renderContent()}
          </div>
        </div>
      );
    };
  },
});

export const RPageView = defineComponent({
  props: props,
  setup(props, ctx) {
    const RPageViewContext = reactive({
      context: ctx,
      slots: ctx.slots,
      attrs: ctx.attrs,
      children: [],
      element: null,
    });
    provide("RPageViewContext", RPageViewContext);

    return () => {
      return [renderSlot(ctx.slots, "default"), <Context {...ctx.attrs} {...props}></Context>];
    };
  },
});

export const RPageViewItem = defineComponent({
  setup(props, context) {
    const RPageViewContext = inject("RPageViewContext") || {};

    const item = reactive({
      context: context,
      slots: context.slots,
      attrs: context.attrs,
    });

    RPageViewContext?.children?.push?.(item);

    onBeforeUnmount(() => {
      RPageViewContext?.children?.filter?.((el) => el !== item);
    });

    return () => {
      return null;
    };
  },
});
