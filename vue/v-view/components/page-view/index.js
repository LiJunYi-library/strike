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
  watchEffect,
  ref,
} from "vue";
import "./index.scss";

const TAP_OFFSET = 5;

function getDirection(x, y) {
  if (x > y) {
    return "horizontal";
  }
  if (y > x) {
    return "vertical";
  }
  return "";
}

function useTouch() {
  const startX = ref(0);
  const startY = ref(0);
  const deltaX = ref(0);
  const deltaY = ref(0);
  const offsetX = ref(0);
  const offsetY = ref(0);
  const direction = ref("");
  const isTap = ref(true);
  const isVertical = () => direction.value === "vertical";
  const isHorizontal = () => direction.value === "horizontal";
  const reset = () => {
    deltaX.value = 0;
    deltaY.value = 0;
    offsetX.value = 0;
    offsetY.value = 0;
    direction.value = "";
    isTap.value = true;
  };
  const start = (event) => {
    reset();
    startX.value = event.touches[0].clientX;
    startY.value = event.touches[0].clientY;
  };
  const move = (event) => {
    const touch = event.touches[0];
    deltaX.value = (touch.clientX < 0 ? 0 : touch.clientX) - startX.value;
    deltaY.value = touch.clientY - startY.value;
    offsetX.value = Math.abs(deltaX.value);
    offsetY.value = Math.abs(deltaY.value);
    const LOCK_DIRECTION_DISTANCE = 10;
    if (
      !direction.value ||
      (offsetX.value < LOCK_DIRECTION_DISTANCE && offsetY.value < LOCK_DIRECTION_DISTANCE)
    ) {
      direction.value = getDirection(offsetX.value, offsetY.value);
    }
    if (isTap.value && (offsetX.value > TAP_OFFSET || offsetY.value > TAP_OFFSET)) {
      isTap.value = false;
    }
  };
  return {
    move,
    start,
    reset,
    startX,
    startY,
    deltaX,
    deltaY,
    offsetX,
    offsetY,
    direction,
    isVertical,
    isHorizontal,
    isTap,
  };
}

const props = {
  listHook: Object,
  lazy: Boolean,
  flex: { type: Boolean, default: false },
  cache: { type: Boolean, default: true },
  width: { type: Number, default: window.innerWidth },
  behavior: { type: String, default: "smooth" }, // smooth  instant
  collect: { type: Array, default: () => [] },
};

const Context = defineComponent({
  props,
  setup(props, context) {
    const touch = useTouch();
    const delta = computed(() => touch.deltaX.value || 0);

    const RPageViewContext = inject("RPageViewContext") || {};
    const containerHtml = ref();
    const actHtml = ref();
    const children = computed(() => props.collect.map((el) => el.component).filter(Boolean));
    const width = computed(() => containerHtml.value?.getBoundingClientRect?.()?.width);
    const height = computed(() => (props.flex ? "" : actHtml.value?.offsetHeight));
    const parentW = computed(() => width.value * (props.listHook?.list?.length ?? 0) + "px");
    const translateX = ref(width.value * -props.listHook.index + delta.value);
    const isUseHook = computed(() => !children.value?.length);
    const listRenderData = computed(() => (isUseHook.value ? props.listHook.list : children.value));
    const minTranslateX = computed(() => (listRenderData.value.length - 1) * -width.value);
    const maxTranslateX = computed(() => 0);
    let parentHtml = null;
    const itemsHtml = [];
    const isTransition = ref(false);
    const disableSwipHorizontal = computed(() => {
      const x = translateX.value + touch.deltaX.value;
      if (x > maxTranslateX.value) return true;
      if (x < minTranslateX.value) return true;
      return false;
    });

    onMounted(() => {
      isTransition.value = false;
    });

    watchEffect(() => {
      console.log("watchEffect");
      translateX.value = width.value * -props.listHook.index;
      isTransition.value = true;
      setTranslateX(width.value * -props.listHook.index);
    });

    function setTranslateX(x) {
      if (!parentHtml) return;
      parentHtml.style.transform = `translateX(${x}px)`;
    }

    function onTransitionEnd(event) {
      // console.log("onTransitionEnd");
      isTransition.value = false;
    }

    function onTouchStart(event) {
      // let tou = event.touches[0];
      // var pressure = tou.force / tou.radiusX / tou.radiusY;
      // console.log(" onTouchStart tou.force", tou.force, pressure);
      isTransition.value = false;
      touch.start(event);
    }

    function onTouchMove(event) {
      // let tou = event.touches[0];
      // var pressure = tou.force / tou.radiusX / tou.radiusY;
      // console.log(" onTouchMove tou.force", event);
      // console.log(" onTouchMove tou.force", tou.force, tou.maxForce);
      touch.move(event);
      if (touch.isHorizontal()) onSwipHorizontal(event);
    }

    function onTouchEnd(event) {
      // let tou = event.touches[0];
      // console.log("onTouchEnd tou.force", event);
      if (touch.isHorizontal()) onSwipHorizontalEnd(event);
    }

    function onSwipHorizontal(event) {
      if (disableSwipHorizontal.value) return;
      event.stopPropagation();
      event.preventDefault();
      setTranslateX(translateX.value + touch.deltaX.value);
    }

    function onSwipHorizontalEnd(event) {
      if (disableSwipHorizontal.value) return;
      event.stopPropagation();
      event.preventDefault();
      if (touch.deltaX.value < 0) onSwipLeft();
      if (touch.deltaX.value > 0) onSwipRight();
    }

    function onSwipLeft() {
      isTransition.value = true;
      if (touch.offsetX.value > width.value / 3) {
        const index = props.listHook.index + 1;
        if (index >= props.listHook?.list?.length) return;
        props?.listHook?.updateIndex(index);
      } else {
        setTranslateX(translateX.value);
      }
    }

    function onSwipRight() {
      isTransition.value = true;
      if (touch.offsetX.value > width.value / 3) {
        const index = props.listHook.index - 1;
        if (index < 0) return;
        props?.listHook?.updateIndex(index);
      } else {
        setTranslateX(translateX.value);
      }
    }

    function onScrollend(params) {
      //
    }

    function update(index) {
      //
    }

    function onScroll(event) {
      //
    }

    function onScrollLeft(event, sLeft) {
      //
    }

    function onScrollRight(event, sLeft) {
      //
    }

    function getItemsHtml(el, same, item, index) {
      itemsHtml[index] = el;
      if (same(item, index)) actHtml.value = el;
    }

    function renderItem(isUseHook, same, item, index) {
      if (Math.abs(props.listHook.index - index) > 1) return null;
      if (isUseHook) return renderSlot(RPageViewContext.slots, "item", { item, index });
      return item.slots?.default?.();
    }

    function renderContent() {
      const same = (item, index) => {
        if (isUseHook.value) return props.listHook.same(item);
        return props.listHook.index === index;
      };

      return renderList(listRenderData.value, (item, index) => {
        return (
          <div
            style={{ width: width.value + "px" }}
            key={index}
            ref={(el) => getItemsHtml(el, same, item, index)}
            class={["r-page-view-item", same(item, index) && "r-page-view-item-same"]}
          >
            {renderItem(isUseHook.value, same, item, index)}
          </div>
        );
      });
    }

    return (vm) => {
      // console.log("rrrrrrr");
      // onScroll={onScroll}
      // onScrollend={onScrollend}
      return (
        <div
          class={["r-page-view"]}
          ref={(el) => (containerHtml.value = el)}
          onTouchstart={onTouchStart}
          onTouchmove={onTouchMove}
          onTouchend={onTouchEnd}
          onTouchcancel={onTouchEnd}
        >
          <div class={["r-page-view-win"]} style={{ height: height.value + "px" }}>
            <div
              ref={(el) => (parentHtml = el)}
              onTransitionend={onTransitionEnd}
              class={[
                "r-page-view-list",
                isTransition.value && "r-page-view-list-transition",
                props.flex && "r-page-view-list-flex",
              ]}
              style={{ width: parentW.value }}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      );
    };
  },
});

export const RPageView = defineComponent({
  props: props,
  setup(props, ctx) {
    const RPageViewContext = reactive({
      context: ctx,
      slots: ctx.slots,
      attrs: ctx.attrs,
      element: null,
    });
    provide("RPageViewContext", RPageViewContext);

    return () => {
      const collect = ctx.slots?.default?.();
      return [collect, <Context {...ctx.attrs} {...props} collect={collect}></Context>];
    };
  },
});

export const RPageViewItem = defineComponent({
  setup(props, context) {
    return () => {
      return null;
    };
  },
});
