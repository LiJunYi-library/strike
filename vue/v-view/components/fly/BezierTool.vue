<template>
  <div class="r-BezierTool">
    <div @click="setting" class="set">设置</div>
    <div class="begain" @click="begainAni">开始</div>
    <div class="ball" :style="ballStyle"></div>
    <Move class="point p1" v-model:x="BO.x" v-model:y="BO.y" @move="move"> </Move>
    <Move class="point p2" v-model:x="BO1.x" v-model:y="BO1.y" @move="move"> </Move>
    <Move class="point p3" v-model:x="BO2.x" v-model:y="BO2.y" @move="move"> </Move>
    <Move class="point p4" v-model:x="BO3.x" v-model:y="BO3.y" @move="move"> </Move>
    <canvas ref="canvas" width="100%" height="100%" style="width: 100%; height: 100%"></canvas>
    <RDialog v-model:visible="visible">
      <div class="dia">
        <RRow>
          <span class="tag p1"></span>
          x: <input type="number" v-model="BO.x" /> y: <input type="number" v-model="BO.y" />
        </RRow>
        <RRow>
          <span class="tag p2"></span>
          x: <input type="number" v-model="BO1.x" /> y: <input type="number" v-model="BO1.y" />
        </RRow>
        <RRow>
          <span class="tag p3"></span>
          x: <input type="number" v-model="BO2.x" /> y: <input type="number" v-model="BO2.y" />
        </RRow>
        <RRow>
          <span class="tag p4"></span>
          x: <input type="number" v-model="BO3.x" /> y: <input type="number" v-model="BO3.y" />
        </RRow>
      </div>
      <div>
        <template v-for="(item, index) in translates" :key="index">
          <RRow>
            <span class="tag p1" :class="['p' + (index + 1)]"></span>
            x:{{ item.x }} y:{{ item.y }}
          </RRow>
        </template>
      </div>
      <div @click="move">确认</div>
    </RDialog>
  </div>
</template>
<script setup lang="jsx">
import {
  defineComponent,
  ref,
  renderSlot,
  reactive,
  computed,
  onMounted,
  watch,
  watchEffect,
} from 'vue';
import {RDialog, RRow} from '@rainbow_ljy/v-view';
import {bser, createAnimate} from './c';

const visible = ref(false);
const canvas = ref('canvas');
const BO = reactive({x: 50, y: 50});
const BO1 = reactive({x: 100, y: 100});
const BO2 = reactive({x: 100, y: 200});
const BO3 = reactive({x: 100, y: 300});
let ctx;
let width;
let height;
const tr = or => ({x: or.x - BO.x, y: or.y - BO.y});
const translates = computed(() => [tr(BO), tr(BO1), tr(BO2), tr(BO3)]);
const ballStyle = reactive({left: 0, top: 0});
const animate = createAnimate({});
const anchorpoints = computed(() => [BO, BO1, BO2, BO3]);

function setting() {
  visible.value = true;
}

function begainAni() {
  animate.play(path => {
    ballStyle.left = `${path.x - 10}px`;
    ballStyle.top = `${path.y - 10}px`;
  });
}

function drownLine() {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  ctx.save();
  ctx.strokeStyle = 'blue';
  ctx.beginPath();
  animate.frames.forEach((item, index) => {
    if (index === 0) {
      ctx.moveTo(item.x, item.y);
    } else {
      ctx.lineTo(item.x, item.y);
    }
  });
  ctx.stroke();
  ctx.restore();
}

function move() {
  console.log(anchorpoints.value);
  animate.setFrames(anchorpoints.value);
  console.log(animate);
  const path = animate.frames[0];
  ballStyle.left = `${path.x - 10}px`;
  ballStyle.top = `${path.y - 10}px`;
  drownLine();
}

onMounted(() => {
  width = canvas.value.offsetWidth;
  height = canvas.value.offsetHeight;
  canvas.value.width = width;
  canvas.value.height = height;
  canvas.value.style.width = width;
  canvas.value.style.height = height;
  ctx = canvas.value.getContext('2d');
  move();
});

///
///
///
const Move = defineComponent({
  props: {
    x: {type: Number, default: () => 0},
    y: {type: Number, default: () => 0},
  },
  emits: ['update:x', 'update:y', 'move'],
  setup(props, context) {
    let startTouch;
    let el;
    const pTop = ref(0);
    const Pleft = ref(0);
    const origin = reactive({
      x: props.x,
      y: props.y,
    });

    let pOffset = {
      height: window.screen.height,
      width: window.screen.width,
      left: 0,
      top: 0,
    };

    function onTouchstart(event) {
      event.stopPropagation();
      //   const touche = event.touches?.[0];
      //   if (!touche) return;
      //   startTouch = touche;
    }

    function onTouchmove(event) {
      event.stopPropagation();
      // event.preventDefault();
      const touche = event.touches?.[0];
      if (!touche || !el) return;
      const cH = el.clientHeight;
      const cW = el.clientWidth;
      const t = touche.clientY - cH / 2 - pOffset.top;
      const l = touche.clientX - cW / 2 - pOffset.left;
      pTop.value = t;
      Pleft.value = l;
      origin.x = touche.clientX;
      origin.y = touche.clientY;
      context.emit('update:x', touche.clientX);
      context.emit('update:y', touche.clientY);
      context.emit('move');
    }

    function onTouchend(event) {
      event.stopPropagation();
      // const touche = event.changedTouches?.[0];
      // startTouch = null;
    }

    function moveTo() {
      if (!el) return;
      const cH = el.clientHeight;
      const cW = el.clientWidth;
      const t = props.y - cH / 2 - pOffset.top;
      const l = props.x - cW / 2 - pOffset.left;
      pTop.value = t;
      Pleft.value = l;
    }

    watch(() => props.y, moveTo);
    watch(() => props.x, moveTo);

    onMounted(() => {
      if (!el?.offsetParent?.getBoundingClientRect) {
        pOffset = el.offsetParent.getBoundingClientRect();
      }
      moveTo();
    });

    function onRef(html) {
      el = html;
    }

    return () => {
      return (
        <div
          ref={onRef}
          onTouchstart={onTouchstart}
          onTouchmove={onTouchmove}
          onTouchend={onTouchend}
          style={{
            top: `${pTop.value}px`,
            left: `${Pleft.value}px`,
          }}>
          {renderSlot(context.slots, 'default', origin)}
        </div>
      );
    };
  },
});
</script>
<style lang="scss">
.r-BezierTool {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2000000;
  overflow: hidden;

  .set {
    position: absolute;
    background: rgb(39, 115, 238);
    top: 0;
    left: 0;
  }

  .begain {
    position: absolute;
    background: rgb(39, 115, 238);
    top: 0;
    right: 0;
  }

  .hint {
    position: absolute;
    color: white;
    left: 0;
    top: 0;
  }

  .point {
    position: absolute;
    width: 30px;
    height: 30px;
    background: rgba(255, 255, 255, 0.519);
  }

  .p1 {
    background: rgba(0, 255, 0, 0.519);
  }

  .p2 {
    background: rgba(255, 255, 0, 0.519);
  }
  .p3 {
    background: rgba(255, 125, 0, 0.519);
  }
  .p4 {
    background: rgba(255, 0, 0, 0.519);
  }

  .tag {
    width: 10px;
    height: 10px;
  }

  .ball {
    position: absolute;
    width: 20px;
    height: 20px;
    background: rgb(200, 200, 0);
    border-radius: 50%;
  }
  input {
    border: 1px solid bisque;
    width: 80px;
  }
  .dia {
    padding: 20px 0;
  }
  .r-popup-content {
    padding: 20px 0;
  }
}
</style>
