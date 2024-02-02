import {defineComponent, ref, onBeforeUnmount, computed, nextTick} from 'vue';
import {Circle} from 'vant';
import './index.scss';

export default defineComponent({
  props: {
    close: [Boolean, String],
    scrollContainer: {type: Object, default: () => document},
    left: Number,
    right: Number,
    top: Number,
    bottom: Number,
  },
  setup(props, context) {
    let vm;
    let startTouch;
    const refreshHeight = 60;
    const maxHeight = 150;
    const height = ref(0);
    const isTransition = ref(false);
    const loading = ref(false);

    async function onRefresh() {
      if (!context.attrs.onRefresh) return;
      const res = context.attrs.onRefresh();
      if (res instanceof Promise) {
        res.finally(() => {
          loading.value = false;
          height.value = 0;
        });
      }
    }

    function onTouchmove(event) {
      if (loading.value === true) return;
      event.stopPropagation();
      // event.preventDefault();
      const touche = event.touches?.[0];
      if (!touche) return;
      // const ru = 100 - touche.clientY;
      let celHeight = touche.clientY - startTouch.clientY;
      if (celHeight < 0) return;
      if (celHeight >= maxHeight) celHeight = maxHeight;
      height.value = celHeight;
      // console.log('onTouchmove', height.value);
      document.scrollingElement.setAttribute('data-scroll', false);
    }

    function onTouchend(event) {
      if (loading.value === true) return;
      event.stopPropagation();
      const touche = event.changedTouches?.[0];
      if (!touche) return;
      if (height.value <= 0) return;
      isTransition.value = true;
      if (height.value > refreshHeight) {
        loading.value = true;
        height.value = refreshHeight;
        onRefresh();
      } else {
        loading.value = false;
        height.value = 0;
      }
      // console.log('onTouchend');
      document.scrollingElement.setAttribute('data-scroll', true);
      document.removeEventListener('touchmove', onTouchmove);
      document.removeEventListener('touchend', onTouchend);
    }

    function onTouchstart(event) {
      if (document.scrollingElement.scrollTop > 0) return;
      if (loading.value === true) return;
      event.stopPropagation();
      const touche = event.touches?.[0];
      if (!touche) return;
      startTouch = touche;
      isTransition.value = false;
      // console.log('startTouch - scrollTop', document.scrollingElement.scrollTop);
      // console.log('startTouch', startTouch);
      document.addEventListener('touchmove', onTouchmove, {passive: false}); // {passive: false}
      document.addEventListener('touchend', onTouchend);
    }

    function onTouchmoveOnOff(event) {
      event.stopPropagation();
      const touche = event.touches?.[0];
      if (!touche) return;
      const y = touche.clientY - startTouch.clientY;
      // console.log('onTouchmove -- y', y);
      if (y >= 1) {
        // console.log('开启上拉加载');
        document.removeEventListener('touchmove', onTouchmoveOnOff, {passive: false});
      }

      if (y <= -1) {
        // console.log('开启滚动事件');
        document.removeEventListener('touchmove', onTouchmoveOnOff, {passive: false});
      }
    }

    const currentRate = computed(() => {
      let r = height.value / refreshHeight;
      if (r > 1) r = 1;
      return r * 100;
    });

    const isRelease = computed(() => {
      return height.value > refreshHeight;
    });

    document.addEventListener('touchstart', onTouchstart);

    onBeforeUnmount(() => {
      document.removeEventListener('touchstart', onTouchstart);
    });

    function renderState() {
      if (isRelease.value) return <span>释放刷新</span>;
      if (loading.value) return <span>正在刷新</span>;
      return <span>下拉刷新</span>;
    }

    function renderIcon() {
      if (loading.value) {
        return (
          <svg class="van-loading__circular refresh-content-loading" viewBox="25 25 50 50">
            <circle cx="50" cy="50" r="20" fill="none"></circle>
          </svg>
        );
      }
      return <Circle size="20px" text="↓" current-rate={currentRate.value}></Circle>;
    }

    context.expose({currentRate, isRelease, loading});
    return v => {
      return (
        <div
          class={['refresh', isTransition.value && 'refresh-transition']}
          style={{height: `${height.value}px`}}>
          <div class="refresh-content-top-space"> </div>
          <div class="refresh-container">
            <div class="refresh-content">
              {renderIcon()}
              <div class="refresh-content-space"> </div>
              {renderState()}
            </div>
          </div>
        </div>
      );
    };
  },
});
