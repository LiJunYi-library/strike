<template>
  <div class="r-tab">
    <div class="r-tab-scroll" ref="scrollHtml">
      <div class="r-tab-list" ref="parentHtml">
        <template v-for="(item, index) in listHook.list" :key="index">
          <div
            :class="['r-tab-item', listHook.same(item) && 'r-tab-item-same']"
            @click="listHook.onSelect(item, index)"
          >
            <slot :item="item" :index="index">
              <div>{{ listHook.formatterLabel(item) }}</div>
            </slot>
          </div>
        </template>
        <Active2 v-memo="[]" :listHook="listHook"></Active2>

        <!-- {renderList(listHook.list, (item, index) => {
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
              {ActiveNode} -->
      </div>
    </div>
  </div>
</template>
<script setup lang="jsx">
import { defineProps, defineComponent, renderSlot, watch, onMounted, ref, nextTick } from "vue";
const props = defineProps({
  listHook: Object,
});
const { proxy: listHook } = props.listHook;
const hook = {
  ...listHook,
};
console.log(hook);

const Active = defineComponent({
  props: {
    listHook: Object,
    htmls: Object,
  },
  setup(props, context) {
    return () => {
      console.log("render RTab Active");
      return <div>555555</div>;
    };
  },
});

const Active2 = defineComponent({
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
          {renderSlot(
            context.slots,
            "default",

            () => [<div class="r-tab-item-active-line" />]
          )}
        </div>
      );
    };
  },
});
</script>
