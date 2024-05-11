import { defineComponent, onMounted, onBeforeUnmount, renderSlot, renderList, watch } from "vue";
import "./index.scss";
import { Swipe, SwipeItem } from "vant";

export const SwipeList = defineComponent({
  props: {
    group: { type: Number, default: () => 1 },
    listHook: { type: Object, default: () => ({}) },
    formaterKey: { type: Function, default: (item, index) => index },
    index: { type: Number, default: () => 0 }, // 废弃
  },
  emits: ["change"],
  setup(props, context) {
    let vm;
    let swipe;
    let obs;

    watch(
      () => props.listHook,
      () => {
        if (typeof props.listHook.index === "number") {
          swipe.swipeTo(props.listHook.index, { immediate: true });
        }
      },
    );

    function onChange(index) {
      props.listHook?.updateIndex?.(index);
      context.emit("change", index);
    }

    try {
      obs = new ResizeObserver(([entrie]) => {
        vm.$forceUpdate();
        swipe.resize();
      });
    } catch (error) {
      //
    }

    onMounted(() => {
      obs?.observe?.(vm.$el);
      if (typeof props.listHook.index === "number") {
        swipe.swipeTo(props.listHook.index, { immediate: true });
      }
    });

    onBeforeUnmount(() => {
      obs?.disconnect?.();
    });

    return (v) => {
      vm = v;
      return (
        <Swipe
          {...context.attrs}
          ref={(el) => {
            swipe = el;
          }}
          onChange={onChange}
        >
          {{
            indicator: () => renderSlot(context.slots, "indicator", props.listHook),
            default: () =>
              renderList(props.listHook.list, (item, index) => {
                return (
                  <SwipeItem key={props.formaterKey(item, index)}>
                    {renderSlot(context.slots, "default", { item, index })}
                  </SwipeItem>
                );
              }),
          }}
        </Swipe>
      );
    };
  },
});
