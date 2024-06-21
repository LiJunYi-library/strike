import {
  defineComponent,
  renderSlot,
  onBeforeUnmount,
  ref,
  reactive,
  Teleport,
} from "vue";
import "./index.scss";

let prveDropdownPopup;

export const RDropdown = defineComponent({
  props: {
    label: { type: [String, Number], default: "" },
    defaultLabel: [String, Number],
    scrollController: Object,
    stopPropagation: { type: Boolean, default: true },
    labelClass: [String, Number],
    popTop: [String, Number, Function],
    popLeft: [String, Number, Function],
    teleport: [String, Number, HTMLElement],
    teleportDisabled: { type: Boolean, default: true },
  },
  setup(props, context) {
    const visible = ref(false);
    const look = ref(false);
    const show = ref(false);
    const unShow = ref(false);

    let dropdownHtml;
    let duration = 250;
    let bool = false;
    let timer;
    let outTimer;

    const ctx = reactive({
      open,
      closed,
      close,
      prveClosed,
      visible,
      look,
      show,
      unShow,
    });

    function open() {
      if (prveDropdownPopup) prveDropdownPopup.prveClosed();
      look.value = true;
      visible.value = true;
      show.value = true;
      unShow.value = false;
      context.emit("open");
      prveDropdownPopup = ctx;
      if (props.scrollController) {
        props.scrollController.elements.forEach((el) => {
          el.setCanScroll(false);
        });
      }
    }

    function closed() {
      console.log("closed");
      look.value = false;
      show.value = false;
      unShow.value = true;
      prveDropdownPopup = undefined;
      context.emit("close");
      context.emit("currentClose");
      console.log( 'currentClose' )
      outTimer = setTimeout(() => {
        visible.value = false;
        context.emit("closed");
        context.emit("currentClosed");
      }, duration);
      if (props.scrollController) {
        props.scrollController.elements.forEach((el) => {
          el.setCanScroll(true);
        });
      }
    }

    function prveClosed() {
      console.log("prveClosed");
      look.value = false;
      show.value = false;
      unShow.value = true;
      prveDropdownPopup = undefined;
      context.emit("close");
      context.emit("prveClose");
      outTimer = setTimeout(() => {
        visible.value = false;
        context.emit("closed");
        context.emit("prveClosed");
      }, duration);
    }

    function close() {
      look.value = false;
      show.value = false;
      unShow.value = true;
      visible.value = false;
      prveDropdownPopup = undefined;
    }

    function onClick(event) {
      context.emit("labelClick");
      console.log("onClick");
      if (props.stopPropagation) event.stopPropagation();
      if (bool) return;
      bool = true;
      visible.value ? closed() : open();
      timer = setTimeout(() => {
        bool = false;
      }, duration);
    }

    function documentClick(event) {
      if (look.value === false) return;
      closed();
    }

    document.addEventListener("click", documentClick);

    onBeforeUnmount(() => {
      document.removeEventListener("click", documentClick);
    });

    const getTop = () => {
      if (props.popTop) {
        if (props.popTop instanceof Function) return props.popTop(dropdownHtml);
      }

      if (props.teleport === "body") {
        const offset = dropdownHtml.getBoundingClientRect();
        return offset.bottom + "px";
      }

      if (!dropdownHtml) return 0;

      return dropdownHtml.offsetHeight + "px";
    };
    //   document.body.getBoundingClientRect
    const getLeft = () => {
      if (props.popLeft) {
        return props.popLeft;
      }
      if (!dropdownHtml) return 0;
      const offset = dropdownHtml.getBoundingClientRect();
      return -offset.left + "px";
    };

    function popupClick(event) {
      event.stopPropagation();
      closed(); //  ios部分机型会出错
    }

    function popupContentClick(event) {
      event.stopPropagation();
    }

    function popupTouchstart(event) {
      event.stopPropagation();
      // closed();   ios部分机型会出错
    }

    function popupContentTouchstart(event) {
      event.stopPropagation();
    }

    return (vm) => {
      return (
        <div
          style={{ zIndex: look.value ? 2001 : 2000 }}
          class="r-dropdown"
          ref={(el) => (dropdownHtml = el)}
        >
          <div class={["r-dropdown-content", props.labelClass]} onClick={onClick}>
            {renderSlot(context.slots, "content", ctx, () => [
              <div class="r-dropdown-text">
                {renderSlot(context.slots, "label", ctx, () => [
                  <div class="r-dropdown-label"> {props.label} </div>,
                ])}
                <span class={["r-dropdown-icon", !look.value && "rote"]}>
                  {renderSlot(context.slots, "icon", ctx, () => [
                    <i class={["iconfont"]}>&#xe887;</i>,
                  ])}
                </span>
              </div>,
            ])}
          </div>

          {visible.value && (
            <Teleport to={props.teleport} disabled={props.teleportDisabled}>
              <div
                onClick={popupClick}
                onTouchstart={popupTouchstart}
                style={{
                  left: getLeft(),
                  top: getTop(),
                  zIndex: look.value ? 2001 : 2000,
                }}
                class={[
                  "r-dropdown-popup animate__animated ",
                  prveDropdownPopup && show.value && "animate__fadeIn",
                  prveDropdownPopup && unShow.value && "animate__fadeOut",
                ]}
              >
                {/* prveDropdownPopup && */}
                <div
                  onClick={popupContentClick}
                  onTouchstart={popupContentTouchstart}
                  class={[
                    "r-dropdown-popup-content animate__animated",
                    show.value && "animate__slideInDown",
                    unShow.value && "animate__slideOutUp",
                  ]}
                >
                  {renderSlot(context.slots, "default", ctx)}
                </div>
              </div>
            </Teleport>
          )}
        </div>
      );
    };
  },
});

export * from "./select";
