import { defineComponent, renderSlot, onBeforeUnmount, ref, inject } from "vue";
import { ScrollController, useScrollController } from "./";

export const RScrollFold = defineComponent({
  props: {
    top: { type: Number, default: 0 },
    scrollController: Object,
  },
  setup(props, context) {
    const top = ref(props.top);
    const node = {
      el: undefined,
      sTop: 0,
      minHeight: 50,
      get clientHeight() {
        return this.el.offsetHeight - this.sTop;
      },
      get maxTop() {
        return this.el.offsetHeight - this.minHeight;
      },
      get clipHeight() {},
    };

    let tY = 0;
    let isDispatch = true;
    let min = -100;
    let max = -50;
    let showHeight = 150;
    let height = 150;

    let asy = {};
    asy.tY = 0;
    asy.isDispatch = true;
    asy.min = -80;
    asy.max = 0;

    function asker(scrollTop, space) {
      asy.tY = asy.tY - space;
      if (asy.tY < asy.min) asy.tY = asy.min;
      if (asy.tY > asy.max) asy.tY = asy.max;
      if (asy.tY === asy.min || asy.tY === asy.max) {
        if (asy.isDispatch === false) unFlout(scrollTop, space);
        asy.isDispatch = true;
      }

      if (asy.min < asy.tY && asy.tY < asy.max) {
        asy.isDispatch = false;
        unFlout(scrollTop, space);
      }

      console.log(asy.tY);
    }

    function unFlout(scrollTop, space) {
      console.log("fufonf");
    }

    function snack(scrollTop, space) {
      tY = tY - space;
      console.log("tY", tY);
      if (tY < min && space > 0) tY = min;
      if (tY > max && space < 0) tY = max;
      if (tY > 0) tY = 0;
      if (tY === min || tY === max) {
        isDispatch = true;
      }

      if (min < tY && tY < max) {
        isDispatch = false;
      }
      showHeight = 150 + tY;
      //   console.log("showHeight",showHeight);
      top.value = tY;
    }

    function scroll(scrollTop, space) {
      //   if (scrollTop > height && space > 0) return;
      //   tY = tY - space;
      //   if (tY > 0) tY = 0;
      //   if (tY < -height) tY = -height;
      //   top.value = tY;

      if (space > 0) {
        node.sTop = node.sTop + space;
        if (node.sTop > node.maxTop) node.sTop = node.maxTop;
        if (node.sTop < 0) node.sTop = 0;
        top.value = -node.sTop;

        // console.log(node.sTop, props.scrollController.otherElements);
        props.scrollController.otherElements.forEach((ele) => {
          //   console.log(ele.element.scrollTop);
          if (ele.element.scrollTop < node.maxTop) {
            ele.scrollTo(node.sTop);
          }
        });
      }

      if (space < 0 && scrollTop < node.maxTop) {
        node.sTop = node.sTop + space;
        if (node.sTop > node.maxTop) node.sTop = node.maxTop;
        if (node.sTop < 0) node.sTop = 0;
        top.value = -node.sTop;
        props.scrollController.otherElements.forEach((ele) => {
          if (ele.element.scrollTop < node.maxTop) {
            ele.scrollTo(node.sTop);
          }
        });
      }

      //   if (space > 0) {
      //     // if( )
      //     // if (tY > 0) tY = 0;
      //     // if (tY < -100) tY = -100;
      //     // top.value = tY;
      //     // console.log(props.scrollController);
      //     // props.scrollController.otherElements.forEach((ele) => {
      //     //   ele.scrollTo(100);
      //     // });
      //   }

      //   if (space < 0 && scrollTop < 100) {
      //     tY = tY - space;
      //     if (tY > 0) tY = 0;
      //     if (tY < -height) tY = -height;
      //     top.value = tY;
      //     return;
      //   }

      //   if (space < 0) {
      //     tY = tY - space;
      //     if (tY > max) tY = max;
      //     top.value = tY;
      //   }
    }

    function onScroll({ scrollTop, space }) {
      //   console.log(scrollTop);

      // console.log("space", space);
      //   asker(scrollTop, space);

      scroll(scrollTop, space);

      //   if (space >= 0) {
      //     snack(scrollTop, space);
      //   }

      //   if (space < 0 && scrollTop < 100) {
      //     snack(scrollTop, space);
      //   }

      /////
    }

    if (props.scrollController) props.scrollController.addEvent(onScroll);
    onBeforeUnmount(() => {
      if (props.scrollController) props.scrollController.removeEvent(onScroll);
    });

    return (vm) => {
      return (
        <div
          style={{
            top: top.value + "px",
          }}
          ref={(el) => (node.el = el)}
          class="r-scroll-fold"
        >
          {renderSlot(context.slots, "default")}
        </div>
      );
    };
  },
});
