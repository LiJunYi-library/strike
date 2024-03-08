import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  reactive,
  onMounted,
  provide,
  inject,
  render,
  onBeforeUnmount,
  ref,
} from "vue";
import "./index.scss";


export const RImageHoc = (options = {}) => {
  const config = {
    props: {},
    renders: {
      error: (props) => (
        <img key="error-img" class={["error", props.errorClass]} src={props.errorSrc}></img>
      ),
      loading: (props) => (
        <img key="loading-img" class={["loading", props.loadingClass]} src={props.loadingSrc}></img>
      ),
    },
    ...options,
  };

  return defineComponent({
    props: {
      src: String,
      width: String,
      height: String,
      position: String,
      fit: { type: String, default: "contain" },
      lazy: Boolean,
      errorSrc: { type: String, default: require("./error.png") },
      errorClass: String,
      loadingSrc: { type: String, default: require("./loading.png") },
      loadingClass: String,
      ...config.props,
    },
    setup(props, ctx) {
      let html, imgNode;
      const isRender = ref(!props.lazy);
      const error = ref(false);
      const loading = ref(true);
      const cache = reactive({
        width: undefined,
        height: undefined,
        naturalWidth: undefined,
        naturalHeight: undefined,
      });

      function obser() {
        if (!props.lazy) return;
        const intersectionObserver = new IntersectionObserver((entries) => {
          isRender.value = entries[0].isIntersecting;
        });
        intersectionObserver.observe(html);
      }

      onMounted(() => {
        obser();
      });

      function refImg(ref) {
        imgNode = ref;
      }

      function onload(event) {
        const el = event.target;
        cache.width = el.width;
        cache.height = el.height;
        cache.naturalWidth = el.naturalWidth;
        cache.naturalHeight = el.naturalHeight;
        error.value = false;
        loading.value = false;
      }

      function onerror() {
        error.value = true;
        loading.value = false;
      }

      function renderImg() {
        if (!isRender.value) return null;
        if (error.value === true) {
          return renderSlot(ctx.slots, "error", {}, () => [config.renders.error(props, ctx)]);
        }

        // if (loading.value === true) {
        //   return renderSlot(ctx.slots, "loading", {}, () => [config.renders.loading(props, ctx)]);
        // }

        return (
          <img
            ref={refImg}
            onerror={onerror}
            onload={onload}
            src={props.src}
            style={{ "object-fit": props.fit, "object-position": props.position }}
          />
        );
      }

      function computeStyle() {
        return {
          width: props.width || cache.width + "px",
          height: props.height || cache.height + "px",
        };
      }

      return () => {
        return (
          <div
            style={computeStyle()}
            data-render={`${isRender.value}`}
            ref={(ref) => (html = ref)}
            class={["r-image"]}
          >
            {renderImg()}
          </div>
        );
      };
    },
  });
};

export const RImage = RImageHoc();
