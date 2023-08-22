import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  watch,
  onMounted,
  ref,
  nextTick,
  withMemo,
  isMemoSame,
} from "vue";
import "./tab.scss";

import { RLoading } from "../loading";

var RTab;
export { RTab };

const Active = defineComponent({
  props: {
    listHook: Object,
    htmls: Object,
  },
  setup(props, context) {
    const { listHook } = props;
    const offset = ref({});
    let actItemHtml = null;

    function getOffset() {
      const { itemsHtml, parentHtml, scrollHtml } = props.htmls;
      let offset = {};
      actItemHtml = itemsHtml[listHook.index];
      // console.log(itemsHtml);
      // console.log(parentHtml);
      // console.log(scrollHtml);
      // console.log(actItemHtml);
      // debugger;
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
      scrollTo(offset.scrollLeft);
      return offset;
    }

    function scrollTo(left) {
      const { scrollHtml } = props.htmls;
      if (!scrollHtml) return;
      scrollHtml.scrollTo({ left, behavior: "smooth" });
    }

    async function setOffset() {
      await nextTick();
      offset.value = getOffset();
    }

    watch(
      () => props.listHook.select,
      () => {
        setOffset();
      }
    );

    onMounted(() => {
      if (listHook.select) setOffset();
    });

    return () => {
      console.log("render RTab Active");
      return (
        <div
          style={{
            width: offset.value.width + "px",
            height: offset.value.height + "px",
            transform: `translateX(${offset.value.left}px) translateY(${offset.value.top}px)`,
          }}
          class={["r-tab-item-active"]}
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
    listHook: Object,
    skelectonCount: {
      type: Number,
      default: 10,
    },
  },
  setup(props, context) {
    const { proxy: listHook } = props.listHook;

    let htmls = {
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
      console.log("render RTab");
      return (
        <div class="r-tab">
          <div class="r-tab-scroll" ref={(el) => (htmls.scrollHtml = el)}>
            <RLoading loadingHook={listHook} loadingClass="r-tab-list" slots={context.slots}>
              <div class="r-tab-list" ref={(el) => (htmls.parentHtml = el)}>
                {renderList(listHook.list, (item, index) => {
                  return (
                    <div
                      class={["r-tab-item", listHook.same(item) && "r-tab-item-same"]}
                      ref={(el) => (htmls.itemsHtml[index] = el)}
                      key={index}
                      onClick={() => {
                        listHook.onSelect(item, index);
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
            </RLoading>
          </div>
        </div>
      );
    };
  },
});
