import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  watch,
  onMounted,
  ref,
  render,
  nextTick,
  withMemo,
  isMemoSame,
  onBeforeUnmount,
  Teleport,
  Transition,
} from "vue";

import { RILoading } from "../icon";

import "./index.scss";

export const ROverlay = defineComponent({
  props: {
    visible: { type: Boolean, default: false },
    closeOnClickOverlay: { type: Boolean, default: true },
    teleport: [Object, String],
  },
  setup(props, context) {
    const visible = ref(props.visible);

    watch(
      () => props.visible,
      () => {
        if (visible.value === props.visible) return;
        visible.value = props.visible;
      }
    );

    function close() {
      visible.value = false;
      context.emit("update:visible", false);
    }

    function open() {
      visible.value = true;
      context.emit("update:visible", true);
    }

    context.expose({ visible, close, open });

    function renderContent() {
      return (
        <Transition name="overlay">
          <div v-show={visible.value} class={["r-overlay"]}>
            {renderSlot(context.slots, "default")}
          </div>
        </Transition>
      );
    }

    return () => {
      if (props.teleport) return <Teleport to={props.teleport}>{renderContent()}</Teleport>;
      return renderContent();
    };
  },
});
