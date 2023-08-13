import { defineComponent, renderList, renderSlot, computed, watch, onMounted, fo, ref } from "vue";
import "./page.scss";

var RViewPage;
export { RViewPage };

RViewPage = defineComponent({
  props: {
    listHook: Object,
  },
  setup(props, context) {
    const { proxy: listHook } = props.listHook;
    const itemsHtml = [];
    let parentHtml = null;
    let scrollHtml = null;
    const offset = ref({});
    const count = ref(0);
    let actItemHtml = null; // computed(() => itemsHtml[listHook.index]);

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
      //   if (listHook.select) {
      //     offset.value = getOffset();
      //   }
    });

    const touch = [];

    function onTouchStart(event) {
      let force = event.changedTouches[0].force;
      touch.push(force);
      console.log(force);
    }

    function onTouchEnd(event) {
      let force = event.changedTouches[0].force;
      touch.push(force);
      console.log(event);
      count.value++;
    }

    function onTouchMove(event) {
      let force = event.changedTouches[0].force;
      touch.push(force);
      console.log(force);
    }

    return (vm) => {
      console.log("render RViewPage");

      return (
        <div class="r-view-page">
          <div
            class="r-view-page-scroll"
            ref={(el) => (scrollHtml = el)}
          >
            <div class="r-view-page-list" ref={(el) => (parentHtml = el)}>
              {renderList(listHook.list, (item, index) => {
                return (
                  <div
                    class={["r-view-page-item", listHook.same(item) && "r-view-page-item-same"]}
                    ref={(el) => (itemsHtml[index] = el)}
                    key={index}
                    onClick={() => {
                      listHook.onSelect(item, index);
                    }}
                  >
                    {renderList(touch, (el) => (
                      <div> {el}</div>
                    ))}
                    <div> {count.value}</div>
                    <div> {listHook.formatterLabel(item)}</div>
                  </div>
                );
              })}
              {/* <div
                style={{
                  width: offset.value.width + "px",
                  height: offset.value.height + "px",
                  left: offset.value.left + "px",
                  top: offset.value.top + "px",
                }}
                class={["r-view-page-item-active", `r-view-page-item-active-${listHook.index}`]}
              >
                {renderSlot(
                  context.slots,
                  "active",
                  { index: listHook.index, item: listHook.select },
                  () => [listHook.formatterLabel(listHook.select)]
                )}
              </div> */}
            </div>
          </div>
        </div>
      );
    };
  },
});
