import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  reactive,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  provide,
  inject,
  watch,
  onBeforeUnmount,
  ref,
} from "vue";
import { useScrollController } from "../index";

const props = {
  listHook: Object,
  lazy: Boolean,
  cache: { type: Boolean, default: true },
  width: { type: [Number, String], default: "" },
  offsetTop: { type: Number, default: 0 },
  keyExtractor: { type: Function, default: ({ index }) => index },
  behavior: { type: String, default: "instant" }, // smooth  instant
  defaultNodes: { type: Array, default: () => [] },
};

const Context = defineComponent({
  props,
  setup(props, context) {
    const pCtx = inject("RScrollPageContext") || {};

    let lock = false;
    let itemHtmls = ref([]);
    const width = computed(() => {
      if (typeof props.width === "number") return props.width + "px";
      return props.width;
    });
    const children = computed(() => props.defaultNodes.map((el) => el.component).filter(Boolean));
    const isUseHook = computed(() => !children.value.length);
    const listRenderData = computed(() => (isUseHook.value ? props.listHook.list : children.value));
    let offsets = ref([]);
    const child = computed(() => children.value[props.listHook.index]);
    const scrollController = useScrollController({
      onScroll(event, sTop) {
        layout(sTop);
      },
      onMounted() {
        scrollTo();
      },
      onResize(entries, sTop) {
        layout(sTop);
      },
    });

    offsets = computed(() =>
      itemHtmls.value
        .map((html) => {
          if (!html) return null;
          const t = scrollController.getOffsetTop(html);
          const top = t - props.offsetTop;
          const bottom = top + html.offsetHeight;
          return { t, top, bottom };
        })
        .filter(Boolean),
    );

    function layout(sTop) {
      const index = offsets.value.findIndex((val) => val.top <= sTop && sTop < val.bottom);
      if (index === -1) {
        return;
      }
      if (props.listHook.index === index) return;
      lock = true;
      props.listHook.updateIndex(index);
      context.emit("change", index);
    }

    function scrollTo() {
      const cProps = child.value?.props ?? {};
      const offset = offsets.value[props.listHook.index];
      if (!offset) return;
      let top = offset.top;
      if (typeof cProps?.top === "number") top = top - cProps?.top;
      if (typeof cProps?.offsetTop === "number") top = offset.t - cProps?.offsetTop;
      if (typeof cProps?.scrollTop === "number") top = cProps?.scrollTop;
      scrollController.context.element.scrollTo({ top: top, behavior: props.behavior });
    }

    watch(
      () => props.listHook.select,
      () => {
        if (lock) return (lock = false);
        scrollTo();
      },
    );

    function setItemHtmls(index, el) {
      itemHtmls.value[index] = el;
    }

    function same(item, index) {
      if (isUseHook.value) return props.listHook.same(item);
      return props.listHook.index === index;
    }

    function renderItem(item, index) {
      if (isUseHook.value) return renderSlot(pCtx.slots, "item", { item, index });
      return item.slots?.default?.();
    }

    onBeforeUpdate(() => {
      itemHtmls.value = [];
    });

    return (vm) => {
      return renderList(listRenderData.value, (item, index) => {
        const val = props.listHook?.list?.[index];
        return (
          <div
            ref={(el) => setItemHtmls(index, el)}
            style={{ width: width.value }}
            key={props.keyExtractor({ item: val, index })}
            class={["r-scroll-page-item", same(item, index) && "r-scroll-page-item-same"]}
          >
            {renderItem(item, index)}
          </div>
        );
      });
    };
  },
});

export const RScrollPage2 = defineComponent({
  props: props,
  setup(props, ctx) {
    const pCtx = reactive({
      context: ctx,
      slots: ctx.slots,
      attrs: ctx.attrs,
      children: [],
      element: null,
      listHook: props.listHook,
      props,
    });

    provide("RScrollPageContext", pCtx);

    return () => {
      const defaultNodes = ctx.slots?.default?.();
      return [
        defaultNodes,
        <Context {...ctx.attrs} {...props} defaultNodes={defaultNodes}></Context>,
      ];
    };
  },
});

export const RScrollPageItem2 = defineComponent({
  props: {
    scrollTop: Number,
    offsetTop: Number,
    top: Number,
  },
  setup(props, context, d) {
    const pCtx = inject("RScrollPageContext") || {};
    return (vm) => {
      return null;
    };
  },
});
