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

const props = {
  listHook: Object,
};

const Context = defineComponent({
  props,
  setup(props, context) {
    // eslint-disable-next-line
    const { listHook } = props;
    const itemsHtml = [];
    let parentHtml = null;
    let containerHtml = null;
    let actItemHtml = null;
    const RViewPageContext = inject("RViewPageContext") || {};

    function getTranslateX() {
      if (!containerHtml) return;
      const width = containerHtml.offsetWidth;
      const nth = listHook.index;
      const x = nth * -width; // 反过来 nth * width - (listHook.list.length - 1) * width
      return x;
    }

    onMounted(() => {
      parentHtml.style.transform = `translateX(${getTranslateX()}px)`;
    });

    function renderContent() {
      if (!RViewPageContext?.children?.length) {
        return renderList(listHook.list, (item, index) => {
          return (
            <div
              class={["r-view-page-item", listHook.same(item) && "r-view-page-item-same"]}
              ref={(el) => (itemsHtml[index] = el)}
              key={index}
            >
              {renderSlot(RViewPageContext.slots, "item")}
            </div>
          );
        });
      }

      return renderList(RViewPageContext.children, (ele, index) => {
        // const l = RViewPageContext.children.length - 1;
        // const item = listHook.list[l - index];
        return (
          <div
            key={index}
            ref={(el) => (itemsHtml[index] = el)}
            class={["r-view-page-item", listHook.same(ele) && "r-view-page-item-same"]}
          >
            {renderSlot(ele.slots, "default")}
          </div>
        );
      });
    }

    return (vm) => {
      return (
        <div class="r-view-page" ref={(el) => (containerHtml = el)}>
          <div
            ref={(el) => (parentHtml = el)}
            style={{
              transform: `translateX(${getTranslateX()}px)`,
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
