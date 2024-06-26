import { defineComponent, ref, onMounted, computed, renderSlot } from 'vue';
import './index.scss';

export const RFloatingBubble = defineComponent({
  props: {
    left: Number,
    right: { type: Number, default: () => 0 },
    top: Number,
    bottom: Number,
  },
  setup(props, context) {
    function is0(num) {
      if (num === 0) return true;
      if (!num) return false;
      return true;
    }
    let el;
    const maxWidth = window.screen.width;
    const maxHeight = window.screen.height;
    let startTouch;
    const pTop = ref(0);
    const Pleft = ref(0);

    function getDefLocation() {
      let top = 0;
      let left = 0;
      if (is0(props.top)) top = props.top * 1;
      if (is0(props.bottom)) top = maxHeight - props.bottom - el?.clientHeight ?? 0;
      if (is0(props.left)) left = props.left * 1;
      if (is0(props.right)) left = maxWidth - props.right - el?.clientWidth ?? 0;
      return { left, top }
    }

    onMounted(() => {
      const loca = getDefLocation();
      pTop.value = loca.top;
      Pleft.value = loca.left;
    })

    function onTouchstart(event) {
      event.stopPropagation();
      const touche = event.touches?.[0];
      if (!touche) return;
      startTouch = touche;
    }

    function onTouchmove(event) {
      event.stopPropagation();
      event.preventDefault();
      const touche = event.touches?.[0];
      if (!touche || !el) return;
      const cH = el.clientHeight;
      const cW = el.clientWidth;
      let t = touche.clientY - cH / 2;
      if (t < 0) t = 0;
      if (t >= maxHeight - cH) t = maxHeight - cH;
      pTop.value = t;
      let l = touche.clientX - cW / 2;
      if (l < 0) l = 0;
      if (l >= maxWidth - cW) l = maxWidth - cW;
      Pleft.value = l;
    }

    function onTouchend(event) {
      event.stopPropagation();
      const touche = event.changedTouches?.[0];
      if (!touche) return;
    }

    function onRef(html) {
      el = html
    }

    return v => {
      return (
        <div
          ref={onRef}
          onTouchstart={onTouchstart}
          onTouchmove={onTouchmove}
          onTouchend={onTouchend}
          style={{
            top: `${pTop.value}px`,
            left: `${Pleft.value}px`,
          }}
          class="r-floating-bubble">
          {renderSlot(context.slots, 'default')}
        </div>
      );
    };
  },
});
