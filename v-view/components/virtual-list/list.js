import { defineComponent, renderList, renderSlot, computed, watch, onMounted, fo, ref } from "vue";
import "./list.scss";

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

  constructor(props) {
    Object.assign(this, props);
    this.isRenderCache = this.isRender;
    let self = this;

    this.page = {
      left: 0,
      top: 0,
      get top() {
        return self.parent.page.top + self.top;
      },
      get bottom() {
        return self.height + self.parent.page.top + self.top;
      },
      get right() {
        return self.width + this.left;
      },
    };
  }

  dispatchRender() {
    this.parent.dispatchRender();
  }

  updateHeight(newHeight) {
    console.log("updateHeight", this, newHeight);
    // let clcH = newHeight - this.height;
    // this.parent.height = this.parent.height + clcH;
    // this.height = newHeight;
  }

  getIsRender(scrollTop, scrollBottom, event) {
    let visible = true;
    if (scrollTop > this.page.bottom) visible = false;
    if (this.page.top > scrollBottom) visible = false;
    return visible;
  }

  onScroll(event, scrollTop) {
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

  dispatchRender() {}

  updateList(array = []) {
    let top = 0;
    this.list = array.map((data, index) => {
      let isRender = top <= this.winHeight;
      let item = new ItemAdapter({
        data,
        index,

        parent: this,
        height: this.avgHeight,
        top,
        isRender,
      });
      // item.page.top = top;
      top = top + this.avgHeight;
      return item;
    });
    this.height = array.length * this.avgHeight;
  }
}

RVirtualList = defineComponent({
  props: {
    listHook: Object,
    list: { type: Array, default: () => [] },
    columnNum: { type: Number, default: 1 },
    avgHeight: { type: Number, default: 210 },
    scrollContainer: { type: Object, default: () => document },
  },
  setup(props, context) {
    let vue;
    // const { proxy: listHook } = props.listHook;
    const { scrollContainer, avgHeight } = props;
    const columns = [];
    const renderItems = ref([]);

    const adapter = new Adapter({
      avgHeight,
      array: props.list,
      dispatchRender: () => {
        renderItems.value = adapter.list.filter((el) => el.isRender);
      },
    });
    // console.log(adapter);
    renderItems.value = adapter.list.filter((el) => el.isRender);

    function onScroll(event) {
      const target = event.target.scrollingElement || event.target;
      adapter.list.forEach((el) => {
        el.onScroll(event, target.scrollTop);
      });
    }

    onMounted(() => {
      // console.log([vue.$el]);
      adapter.page = getOffsetRect(vue.$el);

      // adapter.list.forEach((el) => {
      //   // el.page.top = el.page.top + adapter.page.top;
      //   el.dispatchRender = () => {};
      // });

      let off = {
        clientWidth: vue.$el.clientWidth,
        clientHeight: vue.$el.clientHeight,
        clientLeft: vue.$el.clientLeft,
        clientTop: vue.$el.clientTop,
        scrollWidth: vue.$el.scrollWidth,
        scrollHeight: vue.$el.scrollWidth,
        scrollLeft: vue.$el.scrollLeft,
        scrollTop: vue.$el.scrollTop,
        offsetHeight: vue.$el.offsetHeight,
        offsetLeft: vue.$el.offsetLeft,
        offsetTop: vue.$el.offsetTop,
        offsetWidth: vue.$el.offsetWidth,
      };
      scrollContainer.addEventListener("scroll", onScroll);
      //
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
    onMounted(() => {
      let resizeObserver = new ResizeObserver(async (...arg) => {
        let newWidth = vue.$el.offsetWidth;
        let newHeight = vue.$el.offsetHeight;
        if (itemAdapter.height !== newHeight) {
          // console.log("高度发生变化", itemAdapter.height, newHeight);
          if (newHeight !== 0) itemAdapter.updateHeight(newHeight);
        }
      });
      resizeObserver.observe(vue.$el);
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
