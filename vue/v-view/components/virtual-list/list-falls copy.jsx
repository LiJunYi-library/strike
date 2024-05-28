import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  watch,
  onMounted,
  ref,
  onBeforeUnmount,
  onUnmounted,
} from "vue";
import { arrayLoop, arrayLoopMap } from "@rainbow_ljy/rainbow-js";
import "./list.scss";
import { nextTaskHoc } from "@rainbow_ljy/v-hooks";
import { RLoading } from "../loading";

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

var RVirtualListFalls, RVirtualListItem;
export { RVirtualListFalls };

function getOffsetRect(htmlNode) {
  const rect = {
    width: htmlNode.offsetWidth,
    height: htmlNode.offsetHeight,
    left: htmlNode.offsetLeft,
    top: htmlNode.offsetTop,
  };

  let fun = (node) => {
    if (!node) return;
    rect.top += node.offsetTop;
    rect.left += node.offsetLeft;
    fun(node.offsetParent);
  };
  fun(htmlNode.offsetParent);
  return rect;
}

let ID = 0;

class ItemAdapter {
  data = undefined;
  index = undefined;
  isRender = true;
  isRenderCache = true;
  parent = undefined;

  width = undefined;
  height = undefined;
  left = 0;
  top = undefined;

  scrollTop = 0;
  uuId = 0;

  constructor(props) {
    Object.assign(this, props);
    this.isRenderCache = this.isRender;
    let self = this;

    this.page = {
      left: 0,
      get right() {
        return self.width + this.left;
      },
      get top() {
        return self.parent.page.top + self.top;
      },
      get bottom() {
        return self.height + self.parent.page.top + self.top;
      },
    };

    this.uuId = Math.random() + "id";
  }

  dispatchRender() {
    this.parent.dispatchRender();
  }

  updateHeight(newHeight) {
    // console.log("updateHeight", newHeight);
    this.height = newHeight;

    // requestAnimationFrame(() => {
    //   this.parent.patchList();
    //   this.parent.dispatchRender();
    // });
    this.parent.mergeEvent().then(() => {
      // console.log("mergeEvent");
      this.parent.patchList();
      this.parent.dispatchRender();
    });
  }

  getIsRender(scrollTop, scrollBottom, event) {
    let visible = true;
    if (scrollTop > this.page.bottom) visible = false;
    if (this.page.top > scrollBottom) visible = false;
    return visible;
  }

  onScroll(event, scrollTop) {
    this.scrollTop = scrollTop;
    // if (this.parent.ID === 2) console.log("onScroll", this.parent);
    // console.log("onScroll small", scrollTop);
    this.isRender = this.getIsRender(scrollTop - 500, scrollTop + window.innerHeight + 500);
    if (this.isRender !== this.isRenderCache) {
      this.dispatchRender();
      this.isRenderCache = this.isRender;
    }
    // console.log("onScroll", this);
  }
}

class Adapter {
  array = [];
  list = [];
  columnNum = 2;
  columns = [];

  space = 10;
  scrollTop = 0;
  avgHeight = 0;
  height = 0;
  winHeight = window.innerHeight;
  winWidth = window.innerWidth;
  sapceHorizontal = 10;
  itemThreshold = 0.2

  get itemWidth() {
    return (
      (this.winWidth - (this.columnNum - 1) * this.space - this.sapceHorizontal * 2) /
      this.columnNum
    );
  }

  page = {
    left: 0,
    top: 0,
  };

  constructor(props) {
    if (props instanceof Array) {
      this.array = props;
      this.updateList(this.array);
    } else {
      Object.assign(this, props);
      if (this.array instanceof Array) this.updateList(this.array);
    }
  }

  time0 = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 0);
    });
  };

  mergeEvent = nextTaskHoc()(this.time0);

  dispatchRender() {}

  getMaxHeight() {
    let column = this.columns[0];
    this.columns.forEach((col) => {
      if (col.height > column.height) column = col;
    });
    return column;
  }

  getMinHeight() {
    let column = this.columns[0];
    this.columns.forEach((col) => {
      if (col.height < column.height) column = col;
    });
    return column;
  }

  resetColumns() {
    this.columns = [];
    for (let count = 0; count < this.columnNum; count++) {
      let left = this.space * count + this.itemWidth * count + this.sapceHorizontal;
      this.columns.push({ height: 0, with: this.itemWidth, left });
    }
  }

  setList(array = []) {
    this.array = array;
    this.updateList(this.array);
    this.dispatchRender();
  }

  concatList(array = []) {
    let list = array.map((data, index) => {
      let item = new ItemAdapter({
        data,
        index,
        parent: this,
        scrollTop: this.scrollTop,
        width: this.itemWidth,
        height: this.avgHeight,
      });
      this.measureItems(item);
      return item;
    });
    this.array = this.list.concat(array);
    this.list = this.list.concat(list);
    this.height = this.getMaxHeight()?.height ?? 0;
    this.dispatchRender();
  }

  updateList(array = []) {
    this.resetColumns();

    this.list = array.map((data, index) => {
      let item = new ItemAdapter({
        data,
        index,
        parent: this,
        scrollTop: this.scrollTop,
        width: this.itemWidth,
        height: this.avgHeight,
      });
      this.measureItems(item);
      return item;
    });

    this.height = this.getMaxHeight()?.height ?? 0;
  }

  measureItems(item) {
    const minCol = this.getMinHeight();
    if (minCol.height) minCol.height = minCol.height + this.space;
    item.top = minCol.height;
    item.left = minCol.left;
    minCol.height = minCol.height + item.height;
    item.isRender = item.getIsRender(
      item.scrollTop - 500,
      item.scrollTop + window.innerHeight + 500
    );
  }

  patchList() {
    this.resetColumns();
    this.list.forEach((item) => {
      this.measureItems(item);
    });
    this.height = this.getMaxHeight()?.height ?? 0;
  }
}

RVirtualListFalls = defineComponent({
  props: {
    listHook: { type: Object, default: () => ({ proxy: {} }) },
    list: { type: Array, default: () => [] },
    itemThreshold: { type: Number, default: 0.2 },
    columnNum: { type: Number, default: 2 },
    skelectonCount: { type: Number, default: 4 },
    avgHeight: { type: Number, default: 210 },
    scrollContainer: { type: Object, default: () => document },
    space: { type: Number, default: 8 },
    sapceHorizontal: { type: Number, default: 12 },
    setKey: { type: Function, default: (data, index, uid) => uid },
    emptyImgSrc: {
      type: [Number, String],
      default: require("./empty.png"),
    },
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
    emptyText: {
      type: [Number, String],
      default: "暂无相关数据，试试其他条件吧",
    },
  },
  setup(props, context) {
    ID++;
    const id = ref(ID);
    let vue;
    const { proxy: listHook } = props.listHook;
    const { scrollContainer, avgHeight, space, sapceHorizontal, list, columnNum ,itemThreshold} = props;
    const renderItems = ref([]);
    let bottomHtml;

    const adapter = new Adapter({
      columnNum,
      avgHeight,
      space,
      itemThreshold,
      sapceHorizontal,
      ID,
      array: list,
      dispatchRender: () => {
        renderItems.value = adapter.list.filter((el) => el.isRender);
        // console.log("dispatchRender",renderItems.value);
      },
    });
    // console.log(adapter);
    renderItems.value = adapter.list.filter((el) => el.isRender);

    function onScroll(event) {
      const target = event.target.scrollingElement || event.target;
      adapter.scrollTop = target.scrollTop;
      adapter.list.forEach((el) => {
        el.onScroll(event, target.scrollTop);
      });
    }

    let resizeObserver = new ResizeObserver(async (...arg) => {
      // 需要监听 offsetTop 变化
      // let newWidth = vue.$el.offsetWidth;
      // let newHeight = vue.$el.offsetHeight;
      // adapter.page = getOffsetRect(vue.$el);
      // if (id.value === 2) console.log("resizeObserver", adapter);
    });

    const intersectionObserver = new IntersectionObserver(([entries]) => {
      if (entries.isIntersecting && adapter.height > 0) {
        context.emit("scrollEnd");
      }
    });

    context.expose(adapter);

    onMounted(() => {
      adapter.page = getOffsetRect(vue.$el);
      resizeObserver.observe(vue.$el);
      intersectionObserver.observe(bottomHtml);
      scrollContainer.addEventListener("scroll", onScroll);
    });

    onBeforeUnmount(() => {
      resizeObserver.unobserve(vue.$el);
      resizeObserver.disconnect();
      intersectionObserver.unobserve(bottomHtml);
      intersectionObserver.disconnect();
    });

    function renderfinished() {
      if (!listHook.finished) return null;
      if (!listHook.list || !listHook.list.length) {
        if (!props.emptyText && !props.emptyImgSrc) return null;
        return renderSlot(context.slots, "empty", listHook, () => [
          <div class="list-empty">
            {renderSlot(context.slots, "emptyImg", listHook, () => [
              props.emptyImgSrc && <img width={100} fit="contain" src={props.emptyImgSrc} />,
            ])}
            <div class={"list-hint list-empty-text"}>{props.emptyText}</div>
          </div>,
        ]);
      }
      if (!props.finishedText) return null;
      return renderSlot(context.slots, "finished", listHook, () => [
        <div class="list-hint  list-finished">{props.finishedText}</div>,
      ]);
    }

    function renderLoading() {
      if (!listHook.loading) return null;
      if (!props.loadingText) return null;
      return renderSlot(context.slots, "loading", listHook, () => [
        <div class={"list-hint list-loading"}>
          <span class="van-loading__spinner van-loading__spinner--circular">
            <svg class="van-loading__circular" viewBox="25 25 50 50">
              <circle cx="50" cy="50" r="20" fill="none"></circle>
            </svg>
          </span>
          <span>{props.loadingText}</span>
        </div>,
      ]);
    }

    function renderError() {
      if (!listHook.error) return null;
      return renderSlot(context.slots, "error", listHook, () => [
        <div class={"list-error"}>
          <div>{props.errorText}</div>
          <div
            onClick={() => {
              context.emit("errorClick");
            }}
          >
            点击重新加载
          </div>
        </div>,
      ]);
    }

    function renderBegin() {
      if (!listHook.begin) return null;
      return (
        <div class="r-virtual-list-begin">
          {renderSlot(context.slots, "begin", listHook, () => [
              <div class="r-virtual-list-skelectons" style={{padding:`0 ${props.sapceHorizontal}px`}}>
          {  renderList(props.skelectonCount, (item, index) => {
              return [
                <div class="r-virtual-list-skelecton" style={{
                  width: `calc( (100% - ${space}px) / ${columnNum} )`,
                  'margin-bottom': space + 'px'
                }} >{
                  renderSlot(context.slots, 'skelecton', {item, index})
                }</div>
                
              ];
            })}
            </div>
            // <div class={"list-hint list-begin"}>正在加载中</div>,
          ])}
        </div>
      );
    }

    function onItemIntersection(...arg) {
      context.emit('itemIntersection',...arg)
    }

    function onItemFirstIntersection(...arg) {
      context.emit('itemFirstIntersection',...arg)
    }

    return (vm) => {
      vue = vm;
      // console.log("render virtual-list");
      return (
        <div class={["r-virtual-list"]}>
          <div
            class="r-virtual-list-container"
            style={{
              height: `${adapter.height}px`,
            }}
          >
            {renderList(renderItems.value, (item, index) => {
              // console.log(item.data);
              return (
                <RVirtualListItem
                  onFirstIntersection= {onItemFirstIntersection}
                  onIntersection = {onItemIntersection}
                  top={item.top}
                  key={props.setKey(item.data, item.index, item.uuId)}
                  itemAdapter={item}
                  avgHeight={props.avgHeight}
                  adapter={adapter}
                >
                  {renderSlot(context.slots, "default", { item: item.data, index: item.index })}
                </RVirtualListItem>
              );
            })}
          </div>
          {renderBegin()}
          {renderError()}
          {renderLoading()}
          {renderfinished()}
          <div ref={(el) => (bottomHtml = el)} class="r-virtual-list-bottom"></div>
        </div>
      );
      //
      //
    };
  },
});

RVirtualListItem = defineComponent({
  props: {
    itemAdapter: ItemAdapter,
    adapter: Adapter,
    avgHeight: { type: Number, default: 0 },
    top: { type: Number, default: 0 },
  },
  setup(props, context) {
    const { itemAdapter,adapter } = props;
    let vue;

    function heightListener() {
      let newWidth = vue.$el.offsetWidth;
      let newHeight = vue.$el.offsetHeight;
      if (itemAdapter.height !== newHeight) {
        if (newHeight !== 0) itemAdapter.updateHeight(newHeight);
      }
    }

    let resizeObserver = new ResizeObserver(async (...arg) => {
      heightListener();
    });

    let options = {
      threshold: adapter.itemThreshold,
    };

    const intersectionObserver = new IntersectionObserver(([entries]) => {
      if (entries.isIntersecting ) {
        if(!itemAdapter.isIntersecting){ 
          context.emit('firstIntersection',itemAdapter,entries)
          itemAdapter.isIntersecting = true;
        }
        context.emit('intersection',itemAdapter,entries)
      }
    },options);

    onMounted(() => {
      heightListener();
      resizeObserver.observe(vue.$el);
      intersectionObserver.observe(vue.$el);
    });

    onBeforeUnmount(() => {
      resizeObserver.unobserve(vue.$el);
      resizeObserver.disconnect();
      intersectionObserver.unobserve(vue.$el);
      intersectionObserver.disconnect();
    });
    return (vm) => {
      vue = vm;
      return (
        <div
          top={itemAdapter.top}
          data-top={props.top}
          index={itemAdapter.index}
          class="r-virtual-list-item"
          style={{
            top: `${props.top}px`,
            left: `${itemAdapter.left}px`,
            width: `${itemAdapter.width}px`,
          }}
        >
          <div class="r-virtual-list-item-over-hidden">{renderSlot(context.slots, "default")}</div>
        </div>
      );
    };
  },
});
