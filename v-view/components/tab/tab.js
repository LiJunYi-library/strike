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

// eslint-disable-next-line no-var
var RTab;

export { RTab };

const Active = defineComponent({
  props: {
    listHook: Object,
    htmls: Object,
  },
  setup(props, context) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const { listHook } = props;
    const offset = ref({});
    let actItemHtml = null;
    const isTransition = ref(true);

    function getOffset() {
      const { itemsHtml, parentHtml, scrollHtml } = props.htmls;
      let offset = {};
      actItemHtml = itemsHtml[listHook.index];
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
      }
    );

    onMounted(() => {
      if (listHook.select) loyout();
    });

    context.expose({ loyout, transitionLoyout });

    return () => {
      if (!listHook.select) return null;
      return (
        <div
          style={{
            width: offset.value.width + "px",
            height: offset.value.height + "px",
            transform: `translateX(${offset.value.left}px) translateY(${offset.value.top}px)`,
          }}
          class={["r-tab-item-active", isTransition.value && "r-tab-item-active-transition"]}
        >
          {renderSlot(context.slots, "default", listHook, () => [
            <div class="r-tab-item-active-line" />,
          ])}
        </div>
      );
    };
  },
});

RTab = defineComponent({
  props: {
    clickStop: Boolean,
    listHook: Object,
    skelectonCount: {
      type: Number,
      default: 10,
    },
  },
  setup(props, context) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const { listHook } = props;
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
      }
    );

    return (vm) => {
      return (
        <div class="r-tab">
          <div class="r-tab-scroll" ref={(el) => (htmls.scrollHtml = el)}>
            <RLoading
              skelectonCount={props.skelectonCount}
              loadingHook={listHook}
              loadingClass="r-tab-list"
              slots={context.slots}
            >
              <div class="r-tab-list" ref={(el) => (htmls.parentHtml = el)}>
                {renderList(listHook.list, (item, index) => {
                  if (context?.slots?.item) return context?.slots?.item({ index, item });
                  return (
                    <div
                      class={[
                        "r-tab-item",
                        "r-tab-item" + listHook.formatterValue(item),
                        listHook.same(item) && "r-tab-item-same",
                      ]}
                      ref={(el) => {
                        htmls.itemsHtml[index] = el;
                      }}
                      key={index}
                      onClick={(event) => {
                        if (props.clickStop) event.stopPropagation();
                        if (listHook.onSelect(item, index)) return;
                        context.emit("change", item, index);
                      }}
                    >
                      {renderSlot(context.slots, "default", { index, item }, () => [
                        <div> {listHook.formatterLabel(item)} </div>,
                      ])}
                    </div>
                  );
                })}
                <Active listHook={listHook} htmls={htmls} ref={(el) => (activeNode = el)}>
                  {{
                    default: (...arg) => context.slots?.active?.(...arg),
                  }}
                </Active>
              </div>
            </RLoading>
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
      // eslint-disable-next-line
      const { listHook } = props;

      const htmls = {
        itemsHtml: [],
        parentHtml: null,
        scrollHtml: null,
      };

      const ActiveNode = withMemo(
        [],
        () => (
          <Active listHook={listHook} htmls={htmls}>
            {{
              default: (...arg) => context.slots?.active?.(...arg),
            }}
          </Active>
        ),
        []
      );

      return (vm) => {
        return (
          <div class="r-tab">
            <div class="r-tab-scroll" ref={(el) => (htmls.scrollHtml = el)}>
              <div class="r-tab-list" ref={(el) => (htmls.parentHtml = el)}>
                {renderList(listHook.list, (item, index) => {
                  if (context?.slots?.item) return context?.slots?.item({ index, item });
                  return (
                    <div
                      class={["r-tab-item", listHook.same(item) && "r-tab-item-same"]}
                      ref={(el) => (htmls.itemsHtml[index] = el)}
                      key={index}
                      onClick={(event) => {
                        if (props.clickStop) event.stopPropagation();
                        if (listHook.onSelect(item, index)) return;
                        context.emit("change", item, index);
                      }}
                    >
                      {renderSlot(context.slots, "default", { index, item }, () => [
                        <div> {listHook.formatterLabel(item)} </div>,
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
