import {
  defineComponent,
  renderSlot,
  renderList,
  computed,
  onMounted,
  onBeforeUnmount,
  inject,
  reactive,
  provide,
} from "vue";
import { useScrollController } from "./";
import { arrayLoop, arrayLoopMap } from "@rainbow_ljy/rainbow-js";
import { useListLoadingHoc, loadingProps } from "../loading";

const configProps = {
  bothEndsHeight: { type: Number, default: 0 }, //列表 两端的高度
  space: { type: Number, default: 10 }, // 列表之间空格的间距
  spaceStyle: Object, // 列表之间空格的样式
  avgHeight: { type: Number, default: 120 }, // 每个item高度
  columnNum: { type: Number, default: 1 }, // 一行几个item
  keyExtractor: { type: Function, default: ({ index }) => index },
};

const mProps = {
  ...loadingProps,
  ...configProps,
};

const Context = defineComponent({
  props: {
    ...configProps,
  },
  setup(props, context) {
    const mCtx = inject("RScrollVirtualList2Context") || {};
    return () => {
      return renderList(mCtx.renderList, (item, index) => {
        return (
          <div class="r-scroll-virtual-list-item" style={item.style} key={props.keyExtractor(item)}>
            {renderSlot(mCtx.slots, "default", item)}
          </div>
        );
      });
    };
  },
});

export const RScrollVirtualList2 = defineComponent({
  props: {
    ...mProps,
  },
  setup(props, context) {
    // eslint-disable-next-line
    const { listHook, bothEndsHeight, space, avgHeight, columnNum } = props;
    let contentHtml;
    let bottomHtml;
    let isobserver = false;

    const recycleHeight = () => window.innerHeight * 2; // 有些浏览器初始拿innerHeight有时为0;
    const itemWidth = `calc( ${100 / columnNum}% - ${((columnNum - 1) * space) / columnNum}px )`;
    const loadComs = useListLoadingHoc(listHook, props, context);

    const scrollController = useScrollController({
      onScroll(event, sTop) {
        layout();
      },
      onResize(entries, sTop) {
        layout();
      },
    });

    const mCtx = reactive({
      onRender: () => undefined,
      renderList: [],
      slots: context.slots,
    });
    mCtx.offsetH = computed(() => {
      if (!listHook.list.length) return 0;
      return (
        (avgHeight + space) * Math.ceil(listHook.list.length / columnNum) -
        space +
        bothEndsHeight * 2
      );
    });
    provide("RScrollVirtualList2Context", mCtx);

    function getLeft(i) {
      return `calc( ${(100 / columnNum) * i}% - ${
        (((columnNum - 1) * space) / columnNum) * i
      }px + ${i * space}px )`;
    }

    function renderItems(index, addH = 0, pList = []) {
      const sTop = scrollController.context.element.scrollTop;
      if (index < 0) return pList;
      if (index >= listHook.list.length) return pList;
      if (scrollController.getOffsetTop(contentHtml) - sTop + addH > recycleHeight()) return pList;
      arrayLoop(columnNum, (i) => {
        if (index >= listHook.list.length) return pList;
        const nth = Math.floor(index / columnNum);
        let top = nth * (avgHeight + space) + bothEndsHeight + "px";
        if (nth === 0) top = bothEndsHeight + "px";
        let left = getLeft(i);
        let width = itemWidth;
        let height = avgHeight + "px";
        pList.push({ index, style: { top, left, width, height }, item: listHook.list[index] });
        index++;
      });
      addH = addH + avgHeight + space;
      if (addH < recycleHeight()) return renderItems(index++, addH, pList);
      return pList;
    }

    function layout() {
      if (!scrollController.context.element) return;
      const sTop = scrollController.context.element.scrollTop;
      const offsetTop = scrollController.getOffsetTop(contentHtml);
      let index = Math.floor((sTop - offsetTop) / (avgHeight + space)) * columnNum;
      if (index < 0) index = 0;
      mCtx.renderList = renderItems(index);
    }

    const observerBottom = new IntersectionObserver(([entries]) => {
      if (entries.isIntersecting && isobserver) {
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

    return (vm) => {
      layout();
      return (
        <div class="r-scroll-virtual-list" data-length={listHook.list.length}>
          {renderSlot(context.slots, "header")}
          <div
            ref={(el) => (contentHtml = el)}
            style={{ height: mCtx.offsetH + "px" }}
            class="r-scroll-virtual-list-content"
          >
            <Context keyExtractor={props.keyExtractor}></Context>
          </div>
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
