import {
  defineComponent,
  renderSlot,
  computed,
  onMounted,
  onBeforeUnmount,
  ref,
  reactive,
  provide,
} from "vue";
import "./index.scss";
import { arrayRemove } from "@rainbow_ljy/rainbow-js";

export class ScrollController {
  static scrollControllerList = [];
  onScroll = () => 0;
  onFlotage = () => 0;
  constructor(obj = {}) {
    Object.assign(this, obj);
    ScrollController.scrollControllerList.push(this);
  }

  dispatchFlotage(...arg) {
    ScrollController.scrollControllerList.forEach((element) => {
      element.onFlotage(...arg);
    });
  }

  destroy() {
    arrayRemove(ScrollController.scrollControllerList, this);
  }
}

export const RScroll = defineComponent({
  props: {},
  setup(props, context) {
    const RScrollContext = reactive({
      element: null,
    });
    provide("RScrollContext", RScrollContext);

    function onScroll(event) {
      const sTop = RScrollContext.element.scrollTop;
      event.scrollTop = sTop;
      ScrollController.scrollControllerList.forEach((el) => {
        el.onScroll(event, sTop);
      });
    }

    onMounted(() => {
      RScrollContext.element.addEventListener("scroll", onScroll);
    });

    onBeforeUnmount(() => {
      RScrollContext.element.removeEventListener("scroll", onScroll);
    });

    return (vm) => {
      return (
        <div
          ref={(el) => {
            RScrollContext.element = el;
          }}
          class="r-scroll"
        >
          {renderSlot(context.slots, "default")}
        </div>
      );
    };
  },
});

export * from "./flotage";
export * from "./sticky";
