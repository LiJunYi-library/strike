import {
  defineComponent,
  renderSlot,
  computed,
  onMounted,
  onBeforeUnmount,
  inject,
  reactive,
  provide,
} from "vue";
import "./index.scss";
import { arrayRemove } from "@rainbow_ljy/rainbow-js";

export class ScrollController {
  onScroll = () => 0;
  onFlotage = () => 0;
  events = [];
  elements = [];
  currentElement = undefined;
  otherElements = [];
  constructor(obj = {}) {
    Object.assign(this, obj);
  }

  scrollAllTop(top) {
    this.elements.forEach((ctx) => {
      ctx.element.scrollTop = top;
    });
  }

  addEvent(eventFun) {
    this.events.push(eventFun);
  }

  removeEvent(eventFun) {
    arrayRemove(this.events, eventFun);
  }

  dispatchScroll(...arg) {
    this.events.forEach((fun) => {
      fun(...arg);
    });
  }

  addElement(ele) {
    this.elements.push(ele);
  }

  setCanScroll(bool) {
    this.elements.forEach((el) => {
      el.setCanScroll(bool);
    });
  }

  removeElement(ele) {
    arrayRemove(this.elements, ele);
  }
}

export function useScrollController(props = {}) {
  const RScrollContext = inject("RScrollContext") || {};
  const controller = reactive({
    onScroll: () => undefined,
    onFlotage: () => undefined,
    onResize: () => undefined,
    onMounted: () => undefined,
    ...props,
    destroy,
    getOffsetTop,
    dispatchFlotage,
    context: RScrollContext,
  });

  RScrollContext?.children?.push?.(controller);

  function getOffsetTop(ele, top = 0) {
    if (!RScrollContext.element) return top;
    if (!ele) return top;
    top = top + ele.offsetTop;
    if (ele.offsetParent === RScrollContext.element) return top;
    return getOffsetTop(ele.offsetParent, top);
  }

  function dispatchFlotage(...arg) {
    RScrollContext.children.forEach((element) => {
      element.onFlotage(...arg);
    });
  }

  function destroy() {
    arrayRemove(RScrollContext?.children, this);
  }

  onBeforeUnmount(() => {
    destroy();
  });

  return controller;
}

export const RScroll = defineComponent({
  props: {
    scrollController: Object,
  },
  setup(props, context) {
    const { scrollController: SC } = props;
    const RScrollContext = reactive({
      element: null,
      contentElement: null,
      otherElement: [],
      children: [],
      isHandActuated: false,
    });
    provide("RScrollContext", RScrollContext);
    let prveTop = 0;
    let scrollTop = 0;
    let resizeObserver;

    try {
      resizeObserver = new ResizeObserver(([entries]) => {
        RScrollContext.children.forEach((el) => {
          el.onResize(entries, RScrollContext.element.scrollTop);
        });
      });
    } catch (error) {}

    function onScroll(event) {
      if (RScrollContext.isHandActuated) {
        RScrollContext.isHandActuated = false;
        return;
      }
      // console.log("-------------onScroll");
      if (SC) SC.currentElement = RScrollContext;
      if (SC) SC.otherElements = SC.elements.filter((el) => el !== SC.currentElement);
      scrollTop = RScrollContext.element.scrollTop;
      const maxTop = RScrollContext.element.scrollHeight - RScrollContext.element.offsetHeight;
      if (scrollTop < 0) scrollTop = 0;
      if (scrollTop > maxTop) scrollTop = maxTop;

      const space = scrollTop - prveTop;
      event.space = space;
      event.scrollTop = scrollTop;

      RScrollContext.children.forEach((el) => {
        el.onScroll(event, scrollTop);
      });

      if (SC) SC.dispatchScroll(event);
      context.emit("scrollChange", scrollTop);
      prveTop = scrollTop;
    }

    RScrollContext.scrollTo = (top) => {
      RScrollContext.isHandActuated = true;
      if (typeof top === "number") {
        RScrollContext.element.scrollTop = top;
        prveTop = top;
      }
      if (typeof top === "object") {
        RScrollContext.element.scrollTo(top);
        prveTop = top.top;
      }
    };

    RScrollContext.scrollAdd = (space) => {
      RScrollContext.isHandActuated = true;
      let st = RScrollContext.element.scrollTop + space;
      if (st < 0) st = 0;
      RScrollContext.element.scrollTop = st;
      prveTop = st;
    };

    RScrollContext.setCanScroll = (bool = true) => {
      RScrollContext.element.setAttribute("data-scroll", bool);
    };

    if (SC) SC.addElement(RScrollContext);

    onMounted(() => {
      RScrollContext.children.forEach((el) => {
        el.onMounted(RScrollContext.element.scrollTop);
      });
      resizeObserver?.observe?.(RScrollContext.contentElement);
    });

    onBeforeUnmount(() => {
      if (SC) SC.removeElement(RScrollContext);
      resizeObserver?.disconnect?.();
    });

    function onRef(el) {
      RScrollContext.element = el;
    }

    function onContentRef(el) {
      RScrollContext.contentElement = el;
    }

    return (vm) => {
      return (
        <div ref={onRef} class="r-scroll" onScroll={onScroll}>
          <div ref={onContentRef}>{renderSlot(context.slots, "default")}</div>
        </div>
      );
    };
  },
});

export * from "./flotage";
export * from "./sticky";
export * from "./fold";
export * from "./fixed";
export * from "./list";
export * from "./virtual-list";
export * from "./virtual-scroll-list";
export * from "./scroll-page";
