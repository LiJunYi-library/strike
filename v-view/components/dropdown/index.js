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

let prveDropdownPopup;

export const RDropdown = defineComponent({
  props: {
    label: { type: [String, Number], default: "" },
    defaultLabel: [String, Number],
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
      visible,
      look,
      show,
      unShow,
    });

    function open() {
      if (prveDropdownPopup) prveDropdownPopup.closed();
      look.value = true;
      visible.value = true;
      show.value = true;
      unShow.value = false;
      prveDropdownPopup = ctx;
    }

    function closed() {
      console.log("closed");
      look.value = false;
      show.value = false;
      unShow.value = true;
      prveDropdownPopup = undefined;
      outTimer = setTimeout(() => {
        visible.value = false;
      }, duration);
    }

    function close() {
      prveDropdownPopup = undefined;
      look.value = false;
      show.value = false;
      unShow.value = true;
      visible.value = false;
    }

    function onClick(event) {
      console.log("onClick");
      event.stopPropagation();
      if (bool) return;
      bool = true;
      visible.value ? closed() : open();
      timer = setTimeout(() => {
        bool = false;
      }, duration);
    }

    function documentClick(event) {
      closed();
    }

    document.addEventListener("click", documentClick);

    onBeforeUnmount(() => {
      document.removeEventListener("click", documentClick);
    });

    const top = computed(() => {
      if (!dropdownHtml) return 0;
      return dropdownHtml.offsetHeight + "px";
    });
    //   document.body.getBoundingClientRect
    const left = computed(() => {
      if (!dropdownHtml) return 0;
      const offset = dropdownHtml.getBoundingClientRect();
      return -offset.left + "px";
    });

    // onScroll={(e) => {
    //     e.stopPropagation();
    //     e.defaultPrevented();
    //     console.log("onTouchstart");
    //   }}
    //   onTouchstart={(e) => {
    //     e.stopPropagation();
    //     console.log("onTouchstart");
    //   }}
    //   onTouchmove={(e) => {
    //     e.stopPropagation();
    //   }}
    //   onTouchend={(e) => {
    //     e.stopPropagation();
    //   }}

    function popupClick(event) {
      event.stopPropagation();
    }

    function popupContentClick(event) {
      event.stopPropagation();
    }

    function popupTouchstart(event) {
      event.stopPropagation();
      closed();
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
          <div class="r-dropdown-content" onClick={onClick}>
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
            <div
              onClick={popupClick}
              onTouchstart={popupTouchstart}
              style={{
                left: left.value,
                top: top.value,
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
          )}
        </div>
      );
    };
  },
});

export * from "./select";
