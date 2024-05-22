import { defineComponent, onMounted, ref, nextTick, watch, computed, renderSlot } from "vue";

export const RTextHoc = (options = {}) => {
  const config = {
    props: {},
    emits: [],
    className: "",
    ...options,
  };

  return defineComponent({
    props: {
      text: String,
      maxLine: Number,
      animation: { type: Boolean, default: true },
      isFold: { type: Boolean, default: true },
      ...config.props,
    },
    emits: ["fold", "unfold", ...config.emits],
    setup(props, context) {
      let container;
      let span;
      let line = 0;
      let spanH = 0;
      let index = 0;
      let minText;
      let minHeight;
      let maxHeight;
      const expand = ref(false);
      const moreVisible = ref(!!props.maxLine);
      const renderText = ref("");
      const renderHeight = ref(0);
      const height = computed(() => span?.offsetHeight ?? 0);

      async function draw() {
        if (!props.text) return;
        if (index >= props.text.length) {
          moreVisible.value = false;
          return;
        }
        index += 1;
        const text = props.text.slice(0, index);
        renderText.value = text;
        minText = text;
        await nextTick();
        if (spanH !== span.offsetHeight) {
          spanH = span.offsetHeight;
          minHeight = spanH;
          renderHeight.value = minHeight;
          line += 1;
        }
        if (props.maxLine && line > props.maxLine) {
          index -= 1;
          const text2 = props.text.slice(0, index);
          renderText.value = text2;
          minText = text2;
          await nextTick();
          spanH = span.offsetHeight;
          minHeight = spanH;
          line -= 1;
          moreVisible.value = true;
          renderHeight.value = minHeight;
          return;
        }
        draw();
      }

      function init() {
        line = 0;
        spanH = 0;
        index = 0;
        minText = "";
        expand.value = false;
        moreVisible.value = !!props.maxLine;
        renderText.value = "";
        draw();
      }

      onMounted(init);

      watch(() => props.text, init);

      async function onClick() {
        if (!props.isFold) return;
        if (moreVisible.value === false) return;
        if (expand.value === false) {
          expand.value = true;
          renderText.value = props.text;
          await nextTick();
          maxHeight = span.offsetHeight;
          renderHeight.value = maxHeight;
          context.emit("unfold");
          return;
        }

        context.emit("fold");
        expand.value = false;
        renderText.value = minText;
        renderHeight.value = minHeight;
      }

      function getContainer(el) {
        container = el;
      }

      function getRef(el) {
        span = el;
      }

      const style = computed(() => {
        if (!props.animation) return "";
        return { height: `${renderHeight.value}px` };
      });

      return () => {
        if (!props.text) return null;
        return (
          <div
            ref={getContainer}
            class={["r-text-fold", config.className, props.animation && "r-text-fold-transition"]}
            onClick={onClick}
            style={style.value}
          >
            <span ref={getRef} class="r-text-content">
              {renderSlot(context.slots, "default")}
              {renderText.value}
              {moreVisible.value &&
                (expand.value
                  ? renderSlot(context.slots, "fold", {}, () => [<i class="iconfont">&#xe744;</i>])
                  : renderSlot(context.slots, "unfold", {}, () => [
                      <i class="iconfont">&#xe745;</i>,
                    ]))}
            </span>
          </div>
        );
      };
    },
  });
};

export const RText = RTextHoc();
