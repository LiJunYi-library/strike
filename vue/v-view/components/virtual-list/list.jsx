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

// const listData1000000 = arrayLoopMap(1000000, create);
// const listData100000 = arrayLoopMap(100000, create);
const listData10000 = arrayLoopMap(10000, create);
// const listData1000 = arrayLoopMap(1000, create);
const listData50 = arrayLoopMap(50, create);
const listData502 = arrayLoopMap(50, create);

var RVirtualList, RVirtualListItem;
export { RVirtualList };

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
  }

  dispatchRender() {
    this.parent.dispatchRender();
  }

  updateHeight(newHeight) {
    // console.log("updateHeight", newHeight);
    let clcH = newHeight - this.height;
    this.parent.height = this.parent.height + clcH;
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

  avgHeight = 0;
  height = 0;
  winHeight = window.innerHeight;

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

  updateList(array = []) {
    let top = 0;
    this.list = array.map((data, index) => {
      let item = new ItemAdapter({
        data,
        index,
        parent: this,
        height: this.avgHeight,
        top,
      });
      
      item.isRender = item.getIsRender(
        item.scrollTop - 500,
        item.scrollTop + window.innerHeight + 500
      );
      top = top + this.avgHeight;
      return item;
    });
    this.height = array.length * this.avgHeight;
  }

  patchList() {
    let top = 0;
    this.list.forEach((el) => {
      el.top = top;
      el.isRender = el.getIsRender(el.scrollTop - 500, el.scrollTop + window.innerHeight + 500);
      top = el.height + top;
    });
  }
}

RVirtualList = defineComponent({
  props: {
    listHook: { Object: Array, default: () => ({}) },
    list: { type: Array, default: () => [] },
    columnNum: { type: Number, default: 1 },
    avgHeight: { type: Number, default: 210 },
    scrollContainer: { type: Object, default: () => document },
  },
  setup(props, context) {
    ID++;
    const id = ref(ID);
    // console.log("RVirtualList setup");
    let vue;
    const { proxy: listHook } = props.listHook;
    const { scrollContainer, avgHeight } = props;
    const columns = [];
    const renderItems = ref([]);
    // console.log(props);

    const adapter = new Adapter({
      avgHeight,
      ID,
      array: arrayLoopMap(50, create),
      dispatchRender: () => {
        renderItems.value = adapter.list.filter((el) => el.isRender);
        // console.log("dispatchRender", id.value, renderItems.value);
      },
    });
    // adapter.updateList(arrayLoopMap(50, create));
    // console.log(adapter);
    renderItems.value = adapter.list.filter((el) => el.isRender);

    function onScroll(event) {
      const target = event.target.scrollingElement || event.target;
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

    onMounted(() => {
      adapter.page = getOffsetRect(vue.$el);
      resizeObserver.observe(vue.$el);
      scrollContainer.addEventListener("scroll", onScroll);
    });

    onBeforeUnmount(() => {
      resizeObserver.unobserve(vue.$el);
      resizeObserver.disconnect();
    });

    return (vm) => {
      vue = vm;
      // console.log("render virtual-list");
      return (
        <div class="r-virtual-list" onScroll={onScroll}>
          <div
            class="r-virtual-list-container"
            style={{
              height: `${adapter.height}px`,
            }}
          >
            {renderList(renderItems.value, (item, index) => {
              return (
                <RVirtualListItem
                  key={item.index}
                  itemAdapter={item}
                  avgHeight={props.avgHeight}
                  adapter={adapter}
                >
                  {renderSlot(context.slots, "default", { item: item.data, index: item.index })}
                </RVirtualListItem>
              );
            })}
          </div>
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
  },
  setup(props, context) {
    const { itemAdapter } = props;
    const count = ref(0);
    const top = ref(0);
    let vue;
    let resizeObserver = new ResizeObserver(async (...arg) => {
      let newWidth = vue.$el.offsetWidth;
      let newHeight = vue.$el.offsetHeight;
      if (itemAdapter.height !== newHeight) {
        // console.log("高度发生变化", itemAdapter.height, newHeight);
        if (newHeight !== 0) itemAdapter.updateHeight(newHeight);
      }
    });
    onMounted(() => {
      resizeObserver.observe(vue.$el);
    });

    onBeforeUnmount(() => {
      resizeObserver.unobserve(vue.$el);
      resizeObserver.disconnect();
    });
    return (vm) => {
      vue = vm;
      return (
        <div class="r-virtual-list-item" style={{ top: `${itemAdapter.top}px` }}>
          <div class="r-virtual-list-item-over-hidden">{renderSlot(context.slots, "default")}</div>
        </div>
      );
    };
  },
});
