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
  ref,
} from "vue";
import "./index.scss";
export * from "./index2";

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
    const itemsHtml = [];
    let parentHtml = null;
    let containerHtml = null;
    const actItemHtml = null;
    const RViewPageContext = inject("RViewPageContext") || {};
    const compatibility = {
      className: "r-view-page-compatibility",
      getTranslateX() {
        return 0;
      },
    };
    const normal = {
      className: "r-view-page",
      getTranslateX() {
        if (!containerHtml) return;
        const width = containerHtml.offsetWidth;
        const nth = listHook.index;
        const x = nth * -width; // 反过来 nth * width - (listHook.list.length - 1) * width
        return x;
      },
    };
    const opt = normal;

    onMounted(() => {
      parentHtml.style.transform = `translateX(${opt.getTranslateX()}px)`;
    });

    function renderListHookItem() {
      return renderList(listHook.list, (item, index) => {
        if (props.lazy) {
          if (listHook.same(item)) item.rViewPageIscache = true;
          if (!item.rViewPageIscache) return null;
        }

        return (
          <div
            style={{
              left: `${props.width * index}px`,
              top: "0px",
              width: props.width + "px",
            }}
            class={["r-view-page-item", listHook.same(item) && "r-view-page-item-same"]}
            ref={(el) => (itemsHtml[index] = el)}
            key={index}
          >
            {renderSlot(RViewPageContext.slots, "item", { item, index })}
          </div>
        );
      });
    }

    function renderContent() {
      const isUseHook = !RViewPageContext?.children?.length;
      const listRenderData = isUseHook ? listHook.list : RViewPageContext.children;
      const same = (item, index) => {
        if (isUseHook) return listHook.same(item);
        return listHook.index === index;
      };
      // console.log(listRenderData);

      return renderList(listRenderData, (item, index) => {
        if (props.lazy) {
          if (same(item, index)) item.rViewPageIscache = true;
          if (!item.rViewPageIscache) {
            return (
              <div
                style={{ width: props.width + "px" }}
                key={index}
                ref={(el) => (itemsHtml[index] = el)}
                class={["r-view-page-item", same(item, index) && "r-view-page-item-same"]}
              ></div>
            );
          }
        }

        if (!props.cache && !same(item, index)) {
          return (
            <div
              style={{ width: props.width + "px" }}
              key={index}
              ref={(el) => (itemsHtml[index] = el)}
              class={["r-view-page-item", same(item, index) && "r-view-page-item-same"]}
            ></div>
          );
        }

        return (
          <div
            style={{ width: props.width + "px" }}
            key={index}
            ref={(el) => (itemsHtml[index] = el)}
            class={["r-view-page-item", same(item, index) && "r-view-page-item-same"]}
          >
            {isUseHook
              ? renderSlot(RViewPageContext.slots, "item", { item, index })
              : renderSlot(item.slots, "default")}
          </div>
        );
      });
    }

    function onScroll(params) {
      console.log("params", params);
    }

    return (vm) => {
      return (
        <div class={opt.className} ref={(el) => (containerHtml = el)} onScroll={onScroll}>
          <div
            ref={(el) => (parentHtml = el)}
            style={{
              width: props.width * (listHook?.list?.length ?? 0) + "px",
              transform: `translateX(${opt.getTranslateX()}px)`,
            }}
            class={["r-view-page-list", parentHtml && "r-view-page-list-transition"]}
          >
            {renderContent()}
          </div>
        </div>
      );
    };
  },
});

export const RViewPage = defineComponent({
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
      return [renderSlot(ctx.slots, "default"), <Context {...ctx.attrs} {...props}></Context>];
    };
  },
});

export const RViewPageItem = defineComponent({
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
