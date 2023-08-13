import { defineComponent, renderList, renderSlot, computed, watch, onMounted, fo, ref } from "vue";
import "./tab.scss";

var RTab;
export { RTab };

RTab = defineComponent({
  props: {
    listHook: Object,
  },
  setup(props, context) {
    const { proxy: listHook } = props.listHook;
    const itemsHtml = [];
    let parentHtml = null;
    let scrollHtml = null;
    const offset = ref({});
    let actItemHtml = null; //computed(() => itemsHtml[listHook.index]);

    // console.log(listHook);

    function getOffset() {
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
      scrollTo(offset.scrollLeft);
      return offset;
    }

    function scrollTo(left) {
      if (!scrollHtml) return;
      scrollHtml.scrollTo({ left, behavior: "smooth" });
    }

    watch(props.listHook.select, () => {
      offset.value = getOffset();
    });

    onMounted(() => {
      if (listHook.select) {
        offset.value = getOffset();
      }
    });

    return (vm) => {
      console.log("render RTab");
      return (
        <div class="r-tab">
          <div class="r-tab-scroll" ref={(el) => (scrollHtml = el)}>
            <div class="r-tab-list" ref={(el) => (parentHtml = el)}>
              {renderList(listHook.list, (item, index) => {
                return (
                  <div
                    class={["r-tab-item", listHook.same(item) && "r-tab-item-same"]}
                    ref={(el) => (itemsHtml[index] = el)}
                    key={index}
                    onClick={() => {
                      listHook.onSelect(item, index);
                    }}
                  >
                    <div> {listHook.formatterLabel(item)} </div>
                  </div>
                );
              })}
              <div
                style={{
                  width: offset.value.width + "px",
                  height: offset.value.height + "px",
                  transform: `translateX(${offset.value.left}px) translateY(${offset.value.top}px)`,
                }}
                class={["r-tab-item-active", `r-tab-item-active-${listHook.index}`]}
              >
                {renderSlot(
                  context.slots,
                  "active",
                  { index: listHook.index, item: listHook.select },
                  () => [<div class="r-tab-item-active-line" />]
                )}
              </div>
            </div>
          </div>
        </div>
      );
    };
  },
});
