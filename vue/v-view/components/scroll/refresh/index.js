import { defineComponent, ref, onBeforeUnmount, computed, nextTick } from 'vue';
import { Circle } from 'vant';
import { useScrollController } from "../scroll";
import { RILoading } from '../../icon'
import './index.scss';

export const RScrollRefresh = defineComponent({
  props: {
    maxHeight: { type: Number, default: 70 },
    refreshHeight: { type: Number, default: 50 },
    minTime: { type: Number, default: 500 },
  },
  setup(props, context) {
    const height = ref(0);
    const isTransition = ref(false);
    const loading = ref(false);
    const rate = computed(() => {
      let r = height.value / props.refreshHeight;
      if (r > 1) r = 1;
      return r * 100;
    });
    const isRelease = computed(() => height.value > props.refreshHeight);


    useScrollController({
      onScrollRefresh(event, rh) {
        if (loading.value) return event.preventDefault();
        if (rh < 0) rh = 0;
        height.value = (rh / (props.maxHeight / 2 + rh)) * props.maxHeight
      },
      onTouchstart(event) {
        isTransition.value = false;
        if (loading.value) return event.preventDefault();
      },
      onTouchend(event) {
        isTransition.value = true;
        if (!isRelease.value) return height.value = 0;
        onRefresh()
      }
    })

    async function minTimer() {
      return new Promise((r) => {
        setTimeout(() => {
          r(true)
        }, props.minTime);
      })
    }

    async function onRefresh() {
      if (loading.value) return
      if (!context.attrs.onRefresh) return;
      const res = context.attrs.onRefresh();
      if (res instanceof Promise) {
        loading.value = true;
        Promise.allSettled([res, minTimer()]).finally(() => {
          loading.value = false;
          height.value = 0;
        });
      }
    }

    function onTransitionEnd() {
      isTransition.value = false
    }

    function renderState() {
      if (loading.value) return <span>正在刷新</span>;
      if (isRelease.value) return <span>释放刷新</span>;
      return <span>下拉刷新</span>;
    }
    function renderIcon() {
      if (loading.value) return <RILoading></RILoading>
      return <Circle size="20px" text="↓" current-rate={rate.value}></Circle>;
    }
    return () => {
      return (
        <div
          onTransitionEnd={onTransitionEnd}
          class={['r-scroll-refresh', isTransition.value && 'r-scroll-refresh-transition']}
          style={{ height: `${height.value}px` }}>
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
