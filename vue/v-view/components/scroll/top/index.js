import "./index.scss";
import { defineComponent, ref, computed, renderSlot } from "vue";
import { useScrollController } from "../index";

export const RScrollTop = defineComponent({
  props: {
    src: { type: [Object, String], default: () => require("./top.png") },
    isBack: { type: Boolean, default: true },
    behavior: { type: String, default: "instant" }, // smooth  instant
    backText: { type: String, default: "返回" },
    topText: { type: String, default: "顶部" },
    zIndex: { type: [Number, String], default: 20 },

    left: [Number, String],
    right: [Number, String],
    top: [Number, String],
    bottom: [Number, String],
    visibleLeft: [Number, String],
    visibleRight: [Number, String],
    visibleTop: [Number, String],
    visibleBottom: [Number, String],
    horizontal: { type: [String], default: "right" },
    vertical: { type: [String], default: "bottom" },

    //
    horizontal: { type: [String], default: "right" }, // 'right' 'left'
    vertical: { type: [String], default: "bottom" }, // 'bottom' 'top'
    right: { type: [Number, String], default: () => 20 },
    visibleRight: { type: [Number, String], default: () => -400 },
    bottom: { type: [Number, String], default: () => 100 },
    visibleBottom: { type: [Number, String], default: () => 100 },
  },
  emits: ["scrollTop", "scrollBack"],
  setup(props, context) {
    function is0(num) {
      if (num === 0) return true;
      if (!num) return false;
      return true;
    }

    const maxWidth = window.screen.width;
    const maxHeight = window.screen.height;
    const html = ref();
    const onOff = ref(false);
    let oldTop = 0;
    const offsetY = ref();

    const defP = computed(() => {
      if (!html.value) return {};
      return {
        left: is0(props.left) ? props.left : maxWidth - html.value.offsetWidth - props.right,
        top: is0(props.top) ? props.top : maxHeight - html.value.offsetHeight - props.bottom,
      };
    });

    const visiblep = computed(() => {
      if (!html.value) return {};
      return {
        left: is0(props.visibleLeft)
          ? props.visibleLeft
          : maxWidth - html.value.offsetWidth - props.visibleRight,
        top: is0(props.visibleTop)
          ? props.visibleTop
          : maxHeight - html.value.offsetHeight - props.visibleBottom,
      };
    });

    const top = computed(() => {
      if (typeof offsetY.value === "number") return defP.value.top;

      if (props.vertical === "bottom") {
        const y = visiblep.value.top - scrollController.context.scrollTop;
        if (y <= defP.value.top) return defP.value.top;
        return y;
      }

      const y = visiblep.value.top + scrollController.context.scrollTop;
      if (y >= defP.value.top) return defP.value.top;
      return y;
    });

    const left = computed(() => {
      if (typeof offsetY.value === "number") return defP.value.left;

      if (props.horizontal === "right") {
        const x = visiblep.value.left - scrollController.context.scrollTop;
        if (x <= defP.value.left) return defP.value.left;
        return x;
      }

      const x = visiblep.value.left + scrollController.context.scrollTop;
      if (x >= defP.value.left) return defP.value.left;
      return x;
    });

    const scrollController = useScrollController({
      onScroll(event, sTop) {
        oldTop = sTop;
        offsetY.value = undefined;
        onOff.value = false;
      },
    });

    function goTop(Y) {
      offsetY.value = Y;
      scrollController.context.scrollTo({ top: 0, behavior: props.behavior }, false);
      onOff.value = true;
      context.emit("scrollTop", 0);
    }

    function goBack() {
      offsetY.value = undefined;
      scrollController.context.scrollTo({ top: oldTop, behavior: props.behavior }, false);
      onOff.value = false;
      context.emit("scrollBack", oldTop);
    }

    function onClick() {
      if (!props.isBack) return goTop();
      if (!onOff.value) return goTop(0);
      goBack();
    }

    function onTouchstart(event) {
      event.stopPropagation();
      const touche = event.touches?.[0];
      if (!touche) return;
    }

    function onTouchmove(event) {
      event.stopPropagation();
      event.preventDefault();
      const touche = event.touches?.[0];
      if (!touche) return;
    }

    function onTouchend(event) {
      event.stopPropagation();
      const touche = event.changedTouches?.[0];
      if (!touche) return;
    }

    function getHtml(el) {
      html.value = el;
    }

    context.expose({ scrollController, html, onOff, offsetY });

    return (v) => {
      return (
        <div
          ref={getHtml}
          onTouchstart={onTouchstart}
          onTouchmove={onTouchmove}
          onTouchend={onTouchend}
          onClick={onClick}
          style={{ top: `${top.value}px`, left: `${left.value}px`, zIndex: props.zIndex }}
          class="scroll-top"
        >
          {renderSlot(context.slots, "default", { onOff: onOff.value }, () => [
            renderSlot(context.slots, "default", { onOff: onOff.value }, () => [
              <img
                src={props.src}
                class={["scroll-top-icon", onOff.value && "scroll-top-icon-act"]}
              />,
            ]),
            <div class="text">{onOff.value ? props.backText : props.topText}</div>,
          ])}
        </div>
      );
    };
  },
});
