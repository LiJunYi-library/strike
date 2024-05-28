import {
  defineComponent,
  renderList,
  renderSlot,
  watch,
  onMounted,
  ref,
  nextTick,
  withMemo,
} from "vue";
import "./tab.scss";
import { useResizeObserver } from "@rainbow_ljy/v-hooks";
import { RLoading } from "../loading";

const Active = defineComponent({
  props: {
    listHook: Object,
    htmls: Object,
    lineWidth: [Number, String],
  },
  setup(props, context) {
    const offset = ref({});
    let actItemHtml = null;
    const isTransition = ref(true);

    function getOffset() {
      const { itemsHtml, parentHtml, scrollHtml } = props.htmls;
      let offset = {};
      actItemHtml = itemsHtml[props.listHook.index];
      if (!actItemHtml) return offset;
      const activeOffset = actItemHtml.getBoundingClientRect();
      const parentOffset = parentHtml.getBoundingClientRect();
      const scrollOffset = scrollHtml.getBoundingClientRect();
      offset = {
        width: activeOffset.width,
        height: activeOffset.height,
        left: activeOffset.left - parentOffset.left,
        top: activeOffset.top - parentOffset.top,
        scrollLeft: actItemHtml.offsetLeft - (scrollOffset.width - activeOffset.width) / 2,
      };
      return offset;
    }

    //'instant',"smooth"
    function scrollTo(left, behavior = "instant") {
      const { scrollHtml } = props.htmls;
      if (!scrollHtml) return;
      scrollHtml.scrollTo({ left, behavior });
    }

    async function loyout() {
      await nextTick();
      offset.value = getOffset();
      isTransition.value = false;
      scrollTo(offset.value.scrollLeft);
    }

    async function transitionLoyout() {
      await nextTick();
      offset.value = getOffset();
      isTransition.value = true;
      scrollTo(offset.value.scrollLeft, "smooth");
    }

    watch(
      () => props.listHook.select,
      () => {
        transitionLoyout();
      },
    );

    onMounted(() => {
      if (props.listHook.select) loyout();
    });

    context.expose({ loyout, transitionLoyout });

    return () => {
      if (!props.listHook.select) return null;
      return (
        <div
          style={{
            width: offset.value.width + "px",
            height: offset.value.height + "px",
            transform: `translateX(${offset.value.left}px) translateY(${offset.value.top}px)`,
          }}
          class={["r-tab-item-active", isTransition.value && "r-tab-item-active-transition"]}
        >
          {renderSlot(context.slots, "default", props.listHook, () => [
            <div class="r-tab-item-active-line" style={{ width: props.lineWidth }} />,
          ])}
        </div>
      );
    };
  },
});

export const RTab = defineComponent({
  props: {
    isObserverItems: Boolean,
    clickStop: Boolean,
    listHook: Object,
    lineWidth: [Number, String],
  },
  setup(props, context) {
    let activeNode;
    const htmls = {
      itemsHtml: [],
      parentHtml: null,
      scrollHtml: null,
    };

    useResizeObserver(
      () => htmls.scrollHtml,
      (es) => {
        activeNode?.loyout?.();
      },
    );

    if (props.isObserverItems) {
      useResizeObserver(
        () => htmls.itemsHtml,
        (es) => {
          activeNode?.loyout?.();
        },
      );
    }

    function tabItemClick(event, item, index) {
      if (context.attrs.onItemClick) {
        context.attrs.onItemClick(event, item, index);
        return;
      }

      if (props.clickStop) event.stopPropagation();
      if (props.listHook.onSelect(item, index)) return;
      context.emit("change", item, index);
    }

    return (vm) => {
      return (
        <div class="r-tab">
          <div class="r-tab-scroll" ref={(el) => (htmls.scrollHtml = el)}>
            <div class="r-tab-list" ref={(el) => (htmls.parentHtml = el)}>
              {renderList(props.listHook.list, (item, index) => {
                if (context?.slots?.item) return context?.slots?.item({ index, item });
                return (
                  <div
                    class={[
                      "r-tab-item",
                      "r-tab-item" + props.listHook.formatterValue(item),
                      props.listHook.same(item) && "r-tab-item-same",
                    ]}
                    ref={(el) => {
                      htmls.itemsHtml[index] = el;
                    }}
                    key={index}
                    onClick={(event) => tabItemClick(event, item, index)}
                  >
                    {renderSlot(context.slots, "default", { index, item }, () => [
                      <div> {props.listHook.formatterLabel(item)} </div>,
                    ])}
                  </div>
                );
              })}
              <Active
                listHook={props.listHook}
                htmls={htmls}
                ref={(el) => (activeNode = el)}
                lineWidth={props.lineWidth}
              >
                {{
                  default: (...arg) => context.slots?.active?.(...arg),
                }}
              </Active>
            </div>
          </div>
        </div>
      );
    };
  },
});

function RTabHoc(config = {}) {
  const options = {
    renderSkelecton: () => null,
    ...config,
  };

  return defineComponent({
    props: {
      clickStop: Boolean,
      listHook: Object,
    },
    setup(props, context) {
      const htmls = {
        itemsHtml: [],
        parentHtml: null,
        scrollHtml: null,
      };

      const ActiveNode = withMemo(
        [],
        () => (
          <Active listHook={props.listHook} htmls={htmls}>
            {{
              default: (...arg) => context.slots?.active?.(...arg),
            }}
          </Active>
        ),
        [],
      );

      function tabItemClick(event, item, index) {
        if (context.attrs.onItemClick) {
          context.attrs.onItemClick(event, item, index);
          return;
        }

        if (props.clickStop) event.stopPropagation();
        if (props.listHook.onSelect(item, index)) return;
        context.emit("change", item, index);
      }

      return (vm) => {
        return (
          <div class="r-tab">
            <div class="r-tab-scroll" ref={(el) => (htmls.scrollHtml = el)}>
              <div class="r-tab-list" ref={(el) => (htmls.parentHtml = el)}>
                {renderList(props.listHook.list, (item, index) => {
                  if (context?.slots?.item) return context?.slots?.item({ index, item });
                  return (
                    <div
                      class={["r-tab-item", props.listHook.same(item) && "r-tab-item-same"]}
                      ref={(el) => (htmls.itemsHtml[index] = el)}
                      key={index}
                      onClick={(event) => tabItemClick(event, item, index)}
                    >
                      {renderSlot(context.slots, "default", { index, item }, () => [
                        <div> {props.listHook.formatterLabel(item)} </div>,
                      ])}
                    </div>
                  );
                })}
                {ActiveNode}
              </div>
            </div>
          </div>
        );
      };
    },
  });
}
