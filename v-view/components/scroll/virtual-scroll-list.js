import {
  defineComponent,
  renderSlot,
  onBeforeUnmount,
  ref,
  inject,
  computed,
  render,
  renderList,
  onMounted,
} from "vue";
import { ScrollController, useScrollController } from "./";
import { useLoading } from "@rainbow_ljy/v-hooks";
import { RILoading } from "../icon";
import { arrayLoop, arrayLoopMap, arrayRemove } from "@rainbow_ljy/rainbow-js";

const mProps = {
  skelectonCount: {
    type: Number,
    default: 5,
  },
  showSapce: {
    type: Boolean,
    default: true,
  },
  sapceBothEnds: {
    type: Boolean,
    default: false,
  },
  sapceHeight: {
    type: [Number, String],
    default: 10,
  },
  sapceStyle: [Object],
  sapceClass: String,
  finishedText: {
    type: [Number, String],
    default: "没有更多了",
  },
  loadingText: {
    type: [Number, String],
    default: "正在加载中",
  },
  errorText: {
    type: [Number, String],
    default: "出错了",
  },
  emptySrc: {
    type: [Number, String],
    // eslint-disable-next-line global-require
    default: require("./empty.png"),
  },
  emptyText: {
    type: [Number, String],
    default: "暂无相关数据，试试其他条件吧",
  },

  accumulationList: {
    type: Boolean,
    default: true,
  },

  listHook: Object,

  loadingHook: [Object, Array],
};

function cTitle(num) {
  let str = "";
  const cont = Math.ceil(Math.random() * 100 + 10);
  for (let index = 0; index < cont; index++) {
    str += "我";
  }
  return str;
}

const create = (i, index = 0) => ({
  label: "label-" + i + `-${index}`,
  value: "value-" + i + `-${index}`,
  id: "id-" + i + `-${index}`,
  nth: i,
  size: Math.random(),
  title: cTitle(),
  img:
    i % 2 == 0
      ? "https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg"
      : "https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg",
});

const ListItem = defineComponent({
  props: {
    item: Object,
    index: Number,
    slots: Object,
  },
  setup(props) {
    return () => {
      return props.slots.default(props);
    };
  },
});

export const RVirtualScrollList = defineComponent({
  props: {
    ...mProps,
    bothEndsHeight: { type: Number, default: 0 },
    space: { type: Number, default: 10 },
    spaceStyle: Object,
    avgHeight: { type: Number, default: 200 },
    columnNum: { type: Number, default: 2 },
  },
  setup(props, context) {
    // eslint-disable-next-line
    const { listHook, space, avgHeight } = props;
    const list = arrayLoopMap(200, create);
    // debugger
    const recycle = [];
    const tasks = [];
    const cache = [];
    const recycleHeight = window.innerHeight * 2;
    let pvTop = 0;
    let node;

    let offsetB = 0;
    let offsetT = 0;
    let startIndex = 0;
    let endIndex = 0;
    let gap = ref(0);
    let height = computed(() => {
      let h = avgHeight * list.length;
      return h + gap.value;
    });

    function getRecycleDiv(index = "") {
      // if (recycle.length) {
      //   const div = recycle[0];
      //   div.className = "r-scroll-virtual-list-item item" + index;
      //   div.style.width = "100vw";
      //   recycle.shift();
      //   return div;
      // }
      const div = document.createElement("div");
      div.className = "r-scroll-virtual-list-item item" + index;
      div.style.width = "100vw";
      return div;
    }

    function recycleItems(sTop = 0, index = 0) {
      // const el = tasks[index];
      // if (!el) return;
      // let recycleTop = sTop - recycleHeight;
      // if (recycleTop < 0) recycleTop = 0;
      // if (recycleTop <= el.bottom) return;
      // // console.log("recycleItems", recycleTop, el.bottom);
      // offsetT = offsetT + el.offsetHeight + space;
      // tasks.splice(index, 1);
      // el.remove();
      // recycle.push(el);
      // index++;
      // startIndex++;
      // console.log("recycleItems", startIndex, endIndex, tasks);
      // recycleItems(sTop, index);
      let recycleTop = sTop - recycleHeight;
      if (recycleTop < 0) recycleTop = 0;
      tasks.forEach((el, index) => {
        if (recycleTop <= el.bottom) return;
        offsetT = offsetT + el.offsetHeight + space;
        // tasks.splice(index, 1);
        arrayRemove(tasks, el);
        el.remove();
        recycle.push(el);
        startIndex++;
        console.log("recycleItems", startIndex, endIndex);
      });
    }

    function renderItems(cHeight = 0, addH = 0, sTop) {
      if (cHeight <= addH) return;
      if (endIndex >= list.length) return;
      const div = getRecycleDiv(endIndex);
      div.style.top = offsetB + "px";
      div.top = offsetB;
      div.endIndex = endIndex;
      render(<ListItem item={list[endIndex]} slots={context.slots}></ListItem>, div);
      node.appendChild(div);
      offsetB = offsetB + div.offsetHeight + space;
      addH = addH + div.offsetHeight + space;
      div.bottom = offsetB;
      tasks.push(div);
      endIndex++;
      node.style.height = offsetB + "px";
      // console.log("renderItems", startIndex, endIndex);
      renderItems(cHeight, addH);
    }

    function onScrollDown(sTop) {
      renderItems(sTop + recycleHeight - offsetB, 0, sTop);
      recycleItems(sTop);
      // console.log("onScrollDown", startIndex, endIndex);
    }

    function upRenderItems(cHeight = 0, addH = 0) {
      if (cHeight <= addH) return;
      if (startIndex <= 0) return;
      startIndex--;
      console.log("upRenderItems", startIndex, endIndex);
      const div = getRecycleDiv(startIndex);
      render(<ListItem item={list[startIndex]} slots={context.slots}></ListItem>, div);
      node.insertBefore(div, node.firstChild);
      div.bottom = offsetT;
      offsetT = offsetT - div.offsetHeight - space;
      div.style.top = offsetT + "px";
      div.top = offsetT;
      div.index = startIndex;
      tasks.unshift(div);
      addH = addH + div.offsetHeight + space;
      upRenderItems(cHeight, addH);
    }

    function onScrollUp(sTop) {
      let recycleTop = sTop - recycleHeight;
      if (recycleTop < 0) recycleTop = 0;
      upRenderItems(offsetT - sTop);
    }

    onMounted(() => {
      renderItems(recycleHeight);
    });

    const scrollController = useScrollController({
      onScroll(event, sTop) {
        if (sTop < 0) return;
        if (sTop - pvTop > 0) {
          onScrollDown(sTop);
        } else {
          onScrollUp(sTop);
        }
        pvTop = sTop;
      },
    });

    onBeforeUnmount(() => {
      scrollController.destroy();
    });

    function onRef(el) {
      node = el;
    }

    return (vm) => {
      return (
        <div class="r-scroll-virtual-list">
          {renderSlot(context.slots, "header")}
          <div class="r-scroll-virtual-list-content" ref={onRef}></div>
          {/* {loadComs.renderError()}
        {loadComs.renderLoading()}
        {loadComs.renderBegin({ height: avgHeight, space, column: columnNum })}
        {loadComs.renderfinished()}
        {loadComs.renderEmpty()} */}
          {/* <div ref={(el) => (bottomHtml = el)} class="r-scroll-list-bottom" /> */}
        </div>
      );
    };
  },
});
