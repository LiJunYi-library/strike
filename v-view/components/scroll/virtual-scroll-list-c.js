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
import { arrayLoop, arrayLoopMap, arrayBubbleMin, arrayBubbleMax } from "@rainbow_ljy/rainbow-js";

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

function cTitle(num = 10) {
  let str = "";
  const cont = Math.ceil(Math.random() * 100 + num);
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
  title: i === 5 ? cTitle(1000) : cTitle(),
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
      return <div>{props.slots.default(props)}</div>;
    };
  },
});

export const RVirtualScrollList = defineComponent({
  props: {
    ...mProps,
    bothEndsHeight: { type: Number, default: 0 },
    space: { type: Number, default: 10 },
    spaceStyle: Object,
    avgHeight: { type: Number, default: 120 },
    columnNum: { type: Number, default: 2 },
  },
  setup(props, context) {
    // eslint-disable-next-line
    const { listHook, bothEndsHeight, space, avgHeight, columnNum } = props;
    const list = arrayLoopMap(400, create);
    let node;
    let bottomHtml;
    const recycle = [];
    const tasks = [];
    const cache = [];
    let initLock = false;
    let isobserver = false;
    const recycleHeight = window.innerHeight * 2;
    let itemWidth = `calc( ${100 / columnNum}% - ${((columnNum - 1) * space) / columnNum}px )`;
    let item_width;
    let columns = arrayLoopMap(columnNum, () => ({
      height: 0,
      width: 0,
      left: 0,
      top: 0,
      tasks: [],
      recycle: [],
    }));
    let pvTop = 0;

    function getRecycleDiv(index = "") {
      if (recycle.length) {
        const div = recycle[0];
        div.className = "r-scroll-virtual-list-item item" + index;
        recycle.shift();
        return div;
      }
      const div = document.createElement("div");
      div.className = "r-scroll-virtual-list-item item" + index;
      div.style.width = itemWidth;
      return div;
    }

    let startIndex = 0;
    let endIndex = 0;

    function handleMounted() {
      // console.log([node]);
      item_width = (node.offsetWidth - (columnNum - 1) * space) / columnNum;
      itemWidth = item_width + "px";
      columns = arrayLoopMap(columnNum, (i) => ({
        height: 0,
        width: item_width,
        left: i * (item_width + space),
        top: 0,
        tasks: [],
        recycle: [],
      }));
      renderItems(recycleHeight);
    }

    function renderCache(index) {
      const div = getRecycleDiv();
      const react = cache[index];
      div.className = "r-scroll-virtual-list-item item" + index;
      div.style.left = react.left + "px";
      div.style.top = react.top + "px";
      render(<ListItem item={list[index]} slots={context.slots}></ListItem>, div);
      node.appendChild(div);
    }

    function onclick() {
      console.log(startIndex, endIndex, tasks, cache);
    }

    function renderItems(cHeight = 0, addH = 0) {
      if (endIndex >= list.length) return;
      const column = arrayBubbleMin(columns, (item) => item.height);
      const div = getRecycleDiv(endIndex);

      let react = cache[endIndex];
      console.log("renderItems", endIndex, react);

      if (react) {
        div.style.left = react.left + "px";
        div.style.top = react.top + "px";
        div.index = endIndex;
        div.item = list[endIndex];
        div.column = column;
        div.top = column.height;
        render(
          <ListItem onclick={onclick} item={list[endIndex]} slots={context.slots}></ListItem>,
          div
        );
        node.appendChild(div);
        column.height = column.height + div.offsetHeight + space;
        div.bottom = column.height;
        addH = arrayBubbleMin(columns, (item) => item.height).height;
        div.react = react;
      } else {
        react = {};
        div.style.left = column.left + "px";
        div.style.top = column.height + "px";

        div.index = endIndex;
        div.item = list[endIndex];
        div.column = column;
        div.top = column.height;
        react.top = column.height;
        react.left = column.left;

        render(
          <ListItem onclick={onclick} item={list[endIndex]} slots={context.slots}></ListItem>,
          div
        );
        node.appendChild(div);
        column.height = column.height + div.offsetHeight + space;

        div.bottom = column.height;
        react.bottom = column.height;
        addH = arrayBubbleMin(columns, (item) => item.height).height;
        div.react = react;
        cache.push(react);
      }

      tasks.push(div);
      endIndex++;
      if (cHeight > addH) {
        renderItems(cHeight, addH);
      }
    }

    function recycleItems(sTop, index = 0) {
      const el = tasks[index];
      if (!el) return;
      if (sTop - recycleHeight <= el.bottom) return;
      el.column.top = el.bottom;
      tasks.splice(index, 1);
      el.remove();
      recycle.push(el);
      index++;
      startIndex++;
      recycleItems(sTop, index);
    }

    function onScrollDown(sTop) {
      recycleItems(sTop);
      const column = arrayBubbleMin(columns, (item) => item.height);
      const lerTY = sTop + recycleHeight - column.height;
      if (lerTY >= 0) renderItems(lerTY);
      // console.log(tasks);
      // console.log(cache.length);
      // console.log(columns);
    }

    function upRecycleItems(sTop, index = tasks.length - 1) {
      if (index < 0) return;
      const el = tasks[index];
      if (sTop + recycleHeight >= el.top) return;
      el.column.height = el.top;
      tasks.splice(index, 1);
      el.remove();
      recycle.unshift(el);
      index--;
      endIndex--;
      recycleItems(sTop, index);
    }

    function upRenderItems(sTop) {
      const column = arrayBubbleMax(columns, (item) => item.top);
      let recycleTop = sTop - recycleHeight;
      if (recycleTop < 0) recycleTop = 0;
      if (!tasks[0]) return;
      if (recycleTop > column.top) return;
      const index = tasks[0].index - 1;
      if (index < 0) return;
      console.log(index);
      const div = getRecycleDiv(index);
      const react = cache[index];
      div.style.left = react.left + "px";
      div.style.top = react.top + "px";
      div.index = index;
      div.item = list[index];
      div.react = react;
      render(<ListItem onclick={onclick} item={list[index]} slots={context.slots}></ListItem>, div);
      // node.appendChild(div);
      node.insertBefore(div, node.firstChild);
      column.top = column.top - div.offsetHeight - space;
      div.top = column.top;
      div.bottom = column.top + div.offsetHeight + space;
      tasks.unshift(div);
      div.column = column;
      // console.log(tasks);
      upRenderItems(sTop);
    }

    function onScrollUp(sTop) {
      upRecycleItems(sTop);
      upRenderItems(sTop);
    }

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

    onMounted(handleMounted);

    function onRef(el) {
      node = el;
    }

    return (vm) => {
      return (
        <div class="r-scroll-virtual-list">
          {renderSlot(context.slots, "header")}
          <div
            class="r-scroll-virtual-list-content"
            style={{ height: 200 * list.length + "px" }}
            ref={onRef}
          ></div>
          {/* {loadComs.renderError()}
          {loadComs.renderLoading()}
          {loadComs.renderBegin({ height: avgHeight, space, column: columnNum })}
          {loadComs.renderfinished()}
          {loadComs.renderEmpty()} */}
          <div ref={(el) => (bottomHtml = el)} class="r-scroll-list-bottom" />
        </div>
      );
    };
  },
});
