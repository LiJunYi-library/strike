import {
  defineComponent,
  renderSlot,
  onBeforeUnmount,
  ref,
  inject,
  render,
  renderList,
  onMounted,
} from "vue";
import { ScrollController, useScrollController } from "./";
import { useLoading } from "@rainbow_ljy/v-hooks";
import { RILoading } from "../icon";
import { arrayLoop, arrayLoopMap } from "@rainbow_ljy/rainbow-js";

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
  props: mProps,
  setup(props, context) {
    // eslint-disable-next-line
    const { listHook } = props;
    const recycle = [];
    const tasks = [];
    const recycleBottom = window.innerHeight * 2;
    const space = 10;

    let node;
    const list = arrayLoopMap(100000, create);
    console.log(list);
    //  <div>36987</div>
    // const Item = renderSlot(context.slots, "default", { item: list[0], index: 0 });
    // const cacheItem = <ListItem item={list[0]}></ListItem>;

    // setTimeout(() => {
    //   const div = tasks[0];
    //   tasks.shift();
    //   render(<ListItem item={list[6]} slots={context.slots}></ListItem>, div);
    //   node.appendChild(div);
    //   tasks.push(div);
    // }, 4000);

    const over = false;
    let offsetB = 0;
    let offsetT = 0;
    let NTH = 0;
    let INDEX = -1;

    function getRecycleDiv() {
      if (recycle.length) {
        const div = recycle[0];
        recycle.shift();
        return div;
      }
      const div = document.createElement("div");
      div.className = "r-scroll-virtual-list-item";
      return div;
    }

    function renderItems(cHeight = 0, addH = 0) {
      INDEX = INDEX + 1;
      const div = getRecycleDiv();
      div.style.top = offsetB + "px";
      div.top = offsetB;
      div.INDEX = INDEX;
      render(<ListItem item={list[INDEX]} slots={context.slots}></ListItem>, div);
      node.appendChild(div);
      offsetB = offsetB + div.offsetHeight + space;
      addH = addH + div.offsetHeight + space;
      div.bottom = offsetB;
      tasks.push(div);
      offsetT = tasks.at(0).top;
      NTH = tasks.at(0).INDEX;
      if (cHeight > addH) {
        renderItems(cHeight, addH);
      }
    }

    function onScrollTopRenderItems(cHeight = 0, addH = 0) {
      //   if (NTH <= 0) return;
      NTH = NTH - 1;
      const div = getRecycleDiv();
      render(<ListItem item={list[NTH]} slots={context.slots}></ListItem>, div);
      node.insertBefore(div, node.firstChild);
      div.bottom = offsetT;
      offsetT = offsetT - div.offsetHeight - space;
      div.style.top = offsetT + "px";
      div.top = offsetT;
      div.INDEX = NTH;
      tasks.unshift(div);
      offsetB = tasks.at(-1).bottom;
      INDEX = tasks.at(-1).INDEX;
      addH = addH + div.offsetHeight + space;
      if (cHeight > addH) {
        renderItems(cHeight, addH);
      }
    }

    const scrollController = useScrollController({
      onScroll(event, sTop) {
        if (sTop <= 0) return;
        tasks.forEach((el, index) => {
          //   console.log(el.bottom);
          if (sTop - recycleBottom > el.bottom) {
            tasks.splice(index, 1);
            el.remove();
            recycle.push(el);
            offsetT = tasks.at(0).top;
            NTH = tasks.at(0).INDEX;
          }

          if (sTop + recycleBottom < el.top) {
            tasks.splice(index, 1);
            el.remove();
            recycle.unshift(el);
            offsetB = tasks.at(-1).bottom;
            INDEX = tasks.at(-1).INDEX;
          }
        });

        const learT = sTop - tasks.at(0).top;
        if (learT <= 0) {
          onScrollTopRenderItems(-learT);
        }

        // console.log(sTop);
        const lerTY = sTop + recycleBottom - tasks.at(-1).bottom;
        // console.log(lerTY);
        if (lerTY >= 0) {
          renderItems(lerTY);
          //   console.log(INDEX);
        }

        // console.log("tasks", tasks.length);
        // console.log("recycle", recycle.length);
        console.log(NTH, INDEX);
        console.log(offsetT, offsetB);
      },
    });

    onBeforeUnmount(() => {
      scrollController.destroy();
    });

    onMounted(() => {
      //   for (let index = 0; index < list.length && over === false; index++) {
      //     INDEX = index;
      //     const div = document.createElement("div");
      //     div.className = "r-scroll-virtual-list-item";
      //     div.style.top = offsetB + "px";
      //     div.top = offsetB;
      //     render(<ListItem item={list[index]} slots={context.slots}></ListItem>, div);
      //     node.appendChild(div);
      //     offsetB = offsetB + div.offsetHeight;
      //     div.bottom = offsetB;
      //     tasks.push(div);
      //     if (offsetB >= recycleBottom) over = true;
      //   }

      renderItems(recycleBottom);
    });
    // console.log(list, { item: list[0], index: 0 });

    function onRef(el) {
      node = el;
      //   el.appendChild(div);

      //   console.log(el);

      //   debugger;
    }

    return (vm) => {
      return (
        <div
          class="r-scroll-virtual-list"
          style={{ height: 200 * list.length + "px" }}
          ref={onRef}
        ></div>
      );
    };
  },
});
