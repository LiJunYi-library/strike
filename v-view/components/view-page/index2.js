import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  reactive,
  onMounted,
  provide,
  inject,
  cloneVNode,
  onUpdated,
  onBeforeUnmount,
  ref,
  getCurrentInstance,
  nextTick,
  queuePostFlushCb,
} from "vue";
import "./index.scss";

const hmrDirtyComponents = new Set();
const isFunction = (val) => typeof val === "function";

function resetShapeFlag(vnode) {
  vnode.shapeFlag &= ~256;
  vnode.shapeFlag &= ~512;
}

function getComponentName(Component, includeInferred = true) {
  return isFunction(Component)
    ? Component.displayName || Component.name
    : Component.name || (includeInferred && Component.__name);
}

function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}

function isSameVNodeType(n1, n2) {
  if (
    !!(process.env.NODE_ENV !== "production") &&
    n2.shapeFlag & 6 &&
    hmrDirtyComponents.has(n2.type)
  ) {
    n1.shapeFlag &= ~256;
    n2.shapeFlag &= ~512;
    return false;
  }
  return n1.type === n2.type && n1.key === n2.key;
}
const isSuspense = (type) => type.__isSuspense;
const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
function getInnerChild(vnode) {
  return vnode.shapeFlag & 128 ? vnode.ssContent : vnode;
}
const invokeArrayFns = (fns, arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};

const props = {
  listHook: Object,
  lazy: Boolean,
  cache: { type: Boolean, default: true },
  width: { type: Number, default: window.innerWidth },
};

const Context = defineComponent({
  __isKeepAlive: true,
  props,
  setup(props, context) {
    // eslint-disable-next-line
    const { listHook } = props;
    const RViewPageContext = inject("RViewPageContext") || {};

    const instance = getCurrentInstance();
    const sharedContext = instance.ctx;
    let containerHtml, parentHtml;

    const cache = new Map();
    const keys = new Set();
    let current = null;
    const parentSuspense = instance.suspense;
    const {
      renderer: {
        p: patch,
        m: move,
        um: _unmount,
        o: { createElement },
      },
    } = sharedContext;
    const storageContainer = createElement("div");
    sharedContext.activate = (vnode, container, anchor, namespace, optimized) => {
      const instance2 = vnode.component;
      move(vnode, container, anchor, 0, parentSuspense);
      patch(
        instance2.vnode,
        vnode,
        container,
        anchor,
        instance2,
        parentSuspense,
        namespace,
        vnode.slotScopeIds,
        optimized
      );
      if (parentSuspense) return;
      queuePostFlushCb(() => {
        instance2.isDeactivated = false;
        if (instance2.a) {
          invokeArrayFns(instance2.a);
        }
      });
    };
    sharedContext.deactivate = (vnode) => {
      const instance2 = vnode.component;
      move(vnode, storageContainer, null, 1, parentSuspense);
      if (parentSuspense) return;
      queuePostFlushCb(() => {
        if (instance2.da) {
          invokeArrayFns(instance2.da);
        }
        instance2.isDeactivated = true;
      }, parentSuspense);
    };

    function unmount(vnode) {
      resetShapeFlag(vnode);
      _unmount(vnode, instance, parentSuspense, true);
    }
    function pruneCache(filter) {
      cache.forEach((vnode, key) => {
        const name = getComponentName(vnode.type);
        if (name && (!filter || !filter(name))) {
          pruneCacheEntry(key);
        }
      });
    }
    function pruneCacheEntry(key) {
      const cached = cache.get(key);
      if (!current || !isSameVNodeType(cached, current)) {
        unmount(cached);
      } else if (current) {
        resetShapeFlag(current);
      }
      cache.delete(key);
      keys.delete(key);
    }

    function onScroll() {
      //
    }
    function reChildren() {
      const vNodes = RViewPageContext.slots?.children?.();
      return vNodes;
    }

    let pendingCacheKey = null;
    let pendingCacheVnode;

    const cacheSubtree = () => {
      if (pendingCacheKey != null) {
        cache.set(pendingCacheKey, getInnerChild(pendingCacheVnode));
      }
    };

    onMounted(cacheSubtree);
    onUpdated(cacheSubtree);

    const getTranslateX = () => {
      if (!containerHtml) return 0;
      const width = containerHtml.offsetWidth;
      const nth = listHook.index;
      const x = nth * -width; // 反过来 nth * width - (listHook.list.length - 1) * width
      return x;
    };

    function renderActItem({ item, index }) {
      if (!listHook.same(item)) return null;

      const children = RViewPageContext.slots?.item?.({ item, index });
      const rawVNode = children[0];
      if (children.length > 1) {
        current = null;
        return children;
      } else if (!isVNode(rawVNode) || (!(rawVNode.shapeFlag & 4) && !(rawVNode.shapeFlag & 128))) {
        current = null;
        return rawVNode;
      }

      let vnode = getInnerChild(rawVNode);
      const comp = vnode.type;
      const name = getComponentName(
        isAsyncWrapper(vnode) ? vnode.type.__asyncResolved || {} : comp
      );

      const key = vnode.key == null ? comp : vnode.key;
      const cachedVNode = cache.get(key);
      if (vnode.el) {
        vnode = cloneVNode(vnode);
        if (rawVNode.shapeFlag & 128) {
          rawVNode.ssContent = vnode;
        }
      }
      pendingCacheKey = key;
      // debugger
      if (cachedVNode) {
        vnode.el = cachedVNode.el;
        vnode.component = cachedVNode.component;
        // if (vnode.transition) {
        //   setTransitionHooks(vnode, vnode.transition);
        // }
        vnode.shapeFlag |= 512;
        keys.delete(key);
        keys.add(key);
      } else {
        keys.add(key);
        // if (max && keys.size > parseInt(max, 10)) {
        //   pruneCacheEntry(keys.values().next().value);
        // }
      }
      vnode.shapeFlag |= 256;
      current = vnode;
      const lastNode = isSuspense(rawVNode.type) ? rawVNode : vnode;
      pendingCacheVnode = lastNode;
      return lastNode;
    }

    return (vm) => {
      pendingCacheKey = null;
      return (
        <div class={"r-view-page"} ref={(el) => (containerHtml = el)} onScroll={onScroll}>
          <div
            ref={(el) => (parentHtml = el)}
            style={{
              width: props.width * (listHook?.list?.length ?? 0) + "px",
              transform: `translateX(${getTranslateX()}px)`,
            }}
            class={["r-view-page-list", parentHtml && "r-view-page-list-transition"]}
          >
            {renderList(listHook.list, (item, index) => {
              return (
                <div
                  style={{ width: props.width + "px" }}
                  key={index}
                  class={["r-view-page-item", listHook.same(item) && "r-view-page-item-same"]}
                >
                  {renderActItem({ item, index })}
                </div>
              );
            })}
          </div>
        </div>
      );
    };
  },
});

export const RViewPage2 = defineComponent({
  props: props,
  setup(props, ctx) {
    const RViewPageContext = reactive({
      context: ctx,
      slots: ctx.slots,
      attrs: ctx.attrs,
      children: [],
      element: null,
    });
    provide("RViewPageContext", RViewPageContext);

    return () => {
      const vNode = ctx.slots?.default?.();
      return [vNode, <Context {...ctx.attrs} {...props}></Context>];
    };
  },
});

export const RViewPageItem2 = defineComponent({
  setup(props, context) {
    const RViewPageContext = inject("RViewPageContext") || {};

    const item = reactive({
      context: context,
      slots: context.slots,
      attrs: context.attrs,
    });

    RViewPageContext?.children?.push?.(item);
    onBeforeUnmount(() => {
      RViewPageContext?.children?.filter?.((el) => el !== item);
    });

    return () => {
      return null;
    };
  },
});
