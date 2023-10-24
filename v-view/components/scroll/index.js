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

  removeElement(ele) {
    arrayRemove(this.elements, ele);
  }
}

export function useScrollController(props = {}) {
  const RScrollContext = inject("RScrollContext") || {};
  const controller = reactive({
    onScroll: () => undefined,
    onFlotage: () => undefined,
    ...props,
    destroy,
    dispatchFlotage,
  });

  RScrollContext?.children?.push?.(controller);

  function dispatchFlotage(...arg) {
    RScrollContext.children.forEach((element) => {
      element.onFlotage(...arg);
    });
  }

  function destroy() {
    arrayRemove(RScrollContext?.children, this);
  }

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
      otherElement: [],
      children: [],
      isHandActuated: false,
    });
    provide("RScrollContext", RScrollContext);
    let prveTop = 0;
    let scrollTop = 0;
    if (SC) SC.addElement(RScrollContext);

    function onScroll(event) {
      if (RScrollContext.isHandActuated) {
        RScrollContext.isHandActuated = false;
        return;
      }
      // console.log("-------------onScroll");
      if (SC) SC.currentElement = RScrollContext;
      if (SC) SC.otherElements = SC.elements.filter((el) => el !== SC.currentElement);
      scrollTop = RScrollContext.element.scrollTop;
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
      RScrollContext.element.scrollTop = top;
      prveTop = top;
    };

    function setCanScroll(bool = true) {
      RScrollContext.element.setAttribute("data-scroll", bool);
    }

    RScrollContext.setCanScroll = setCanScroll;

    onBeforeUnmount(() => {
      if (SC) SC.removeElement(RScrollContext);
    });

    return (vm) => {
      return (
        <div
          ref={(el) => {
            RScrollContext.element = el;
          }}
          class="r-scroll"
          onScroll={onScroll}
        >
          {renderSlot(context.slots, "default")}
        </div>
      );
    };
  },
});

export * from "./flotage";
export * from "./sticky";
export * from "./fold";
export * from "./list";
