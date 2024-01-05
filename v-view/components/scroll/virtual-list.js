import { defineComponent, renderSlot, onBeforeUnmount, computed, render, onMounted } from "vue";
import { useScrollController } from "./";
import { arrayLoop, arrayLoopMap } from "@rainbow_ljy/rainbow-js";
import { useListLoadingHoc, loadingProps } from "../loading";

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

  listHook: { type: Object, default: () => ({}) },

  loadingHook: [Object, Array],
};

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

export const RScrollVirtualList = defineComponent({
  props: {
    ...loadingProps,
    bothEndsHeight: { type: Number, default: 0 }, //列表 两端的高度
    space: { type: Number, default: 10 }, // 列表之间空格的间距
    spaceStyle: Object, // 列表之间空格的样式
    avgHeight: { type: Number, default: 120 }, // 每个item高度
    columnNum: { type: Number, default: 1 }, // 一行几个item
  },
  setup(props, context) {
    // eslint-disable-next-line
    const { listHook, bothEndsHeight, space, avgHeight, columnNum } = props;
    let node;
    let bottomHtml;
    let isobserver = false;
    let recycle = [];
    let tasks = [];
    let initLock = false;
    const recycleHeight = window.innerHeight * 2;
    const recycleNum = Math.floor(recycleHeight / (avgHeight + space)) * columnNum;
    const offsetH = computed(() => {
      if (!listHook.list.length) return 0;
      return (
        (avgHeight + space) * Math.ceil(listHook.list.length / columnNum) -
        space +
        bothEndsHeight * 2
      );
    });
    const itemWidth = `calc( ${100 / columnNum}% - ${((columnNum - 1) * space) / columnNum}px )`; //${};

    const loadComs = useListLoadingHoc(listHook, props, context);

    const scrollController = useScrollController({
      onScroll(event, sTop) {
        layout(sTop);
      },
      onResize(entries, sTop) {
        layout(sTop);
      },
    });

    function getLeft(i) {
      return `calc( ${(100 / columnNum) * i}% - ${
        (((columnNum - 1) * space) / columnNum) * i
      }px + ${i * space}px )`;
    }

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

    function renderItems(sTop, index, addH = 0) {
      if (index < 0) return;
      if (index >= listHook.list.length) return;
      if (scrollController.getOffsetTop(node) - sTop + addH > recycleHeight) return;
      arrayLoop(columnNum, (i) => {
        if (index >= listHook.list.length) return;
        const div = getRecycleDiv();
        const nth = Math.floor(index / columnNum);
        let top = nth * (avgHeight + space) + bothEndsHeight + "px";
        if (nth === 0) top = bothEndsHeight + "px";
        div.style.top = top;
        div.style.left = getLeft(i);
        div.style.width = itemWidth;
        div.style.height = avgHeight + "px";
        render(<ListItem item={listHook.list[index]} slots={context.slots}></ListItem>, div);
        node.appendChild(div);
        tasks.push(div);
        index++;
      });
      addH = addH + avgHeight + space;

      if (addH < recycleHeight) renderItems(sTop, index++, addH);
    }

    function layout(sTop) {
      node.innerHTML = "";
      recycle = [...tasks];
      tasks = [];
      const offsetTop = scrollController.getOffsetTop(node);
      if (offsetTop - sTop > recycleHeight) return;
      let index = Math.floor((sTop - offsetTop) / (avgHeight + space)) * columnNum;
      if (index < 0) index = 0;
      renderItems(sTop, index);
    }

    const observerBottom = new IntersectionObserver(([entries]) => {
      if (entries.isIntersecting && isobserver) {
        // if (listHook.error) return null;
        context.emit("scrollEnd");
      }
      isobserver = true;
    });

    onBeforeUnmount(() => {
      observerBottom.disconnect();
    });

    onMounted(() => {
      observerBottom.observe(bottomHtml);
    });

    function onRef(el) {
      node = el;
      if (initLock) return;
      initLock = true;
    }

    return (vm) => {
      return (
        <div class="r-scroll-virtual-list">
          {renderSlot(context.slots, "header")}
          <div
            class="r-scroll-virtual-list-content"
            style={{ height: offsetH.value + "px" }}
            ref={onRef}
          ></div>
          {loadComs.renderError()}
          {loadComs.renderLoading()}
          {loadComs.renderBegin({ height: avgHeight, space, column: columnNum })}
          {loadComs.renderfinished()}
          {loadComs.renderEmpty()}
          <div ref={(el) => (bottomHtml = el)} class="r-scroll-list-bottom" />
        </div>
      );
    };
  },
});
