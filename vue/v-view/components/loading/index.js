import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  watch,
  onMounted,
  ref,
  render,
  nextTick,
  withMemo,
  isMemoSame,
} from "vue";
import { useLoading } from "@rainbow_ljy/v-hooks";

import { RILoading } from "../icon";

import "./index.scss";

export const loadingProps = {
  skelectonCount: {
    type: Number,
    default: 5,
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
  emptySrc: {
    type: [Number, String],
    // eslint-disable-next-line global-require
    default: require("./empty.png"),
  },
  emptyText: {
    type: [Number, String],
    default: "暂无相关数据，试试其他条件吧",
  },
  loadText: {
    type: [Number, String],
    default: "",
  },
  listHook: Object,
  promiseHook: Object,
  loadingHook: [Object, Array],
};

export function useLoadingHoc(props, context, configs = {}) {
  const loadHook = useLoading({ ...props, promiseHook: props.listHook });

  function setRelative(bool = true) {
    if (!configs.parentHtml) return;
    configs.parentHtml.setAttribute("data-relative", bool);
  }

  function setParentHtml(html) {
    configs.parentHtml = html;
    configs?.parentHtml?.setAttribute?.("data-relative", loadHook.loading);
  }

  function renderLoading() {
    if (!loadHook.loading) return null;
    if (!props.loadingText) return null;
    setRelative(loadHook.loading);
    return renderSlot(context.slots, "loading", props.listHook, () => [
      <div class={["r-c-loading r-loading"]}>
        <RILoading class="r-c-loading-icon r-loading-icon" />
        <div class={["r-c-loading-text r-loading-text"]}>{props.loadingText}</div>
      </div>,
    ]);
  }

  function renderfinished() {
    if (loadHook.loading) return null;
    if (!props.listHook.finished) return null;
    if (!props.listHook.list || !props.listHook.list.length) return null;
    if (!props.finishedText) return null;
    return renderSlot(context.slots, "finished", props.listHook, () => [
      <div class="r-c-finished r-finished">{props.finishedText}</div>,
    ]);
  }

  function renderEmpty() {
    if (loadHook.loading) return null;
    if (!props.listHook.finished) return null;
    if (props.listHook?.list?.length) return null;
    if (!props.emptyText && !props.emptySrc) return null;
    return renderSlot(context.slots, "empty", props.listHook, () => [
      <div class="r-c-empty r-empty">
        {renderSlot(context.slots, "emptyImg", props.listHook, () => [
          props.emptySrc && (
            <img class={"r-c-empty-img r-empty-img"} fit="contain" src={props.emptySrc} />
          ),
        ])}
        {props.emptyText && <div class={"r-c-empty-text r-empty-text"}>{props.emptyText}</div>}
      </div>,
    ]);
  }

  function renderError() {
    if (loadHook.loading) return null;
    if (!props.listHook.error) return null;
    return renderSlot(context.slots, "error", props.listHook, () => [
      <div class="r-c-error r-error" onClick={() => context.emit("errorClick")}>
        <div class="r-c-error-text r-error-text">{props.errorText}</div>
      </div>,
    ]);
  }

  function renderBegin() {
    if (!loadHook.begin) return null;
    return (
      <div class="r-c-begin r-begin">
        {renderSlot(context.slots, "begin", props.listHook, () => [
          <div
            class="r-c-skelectons r-skelectons"
            style={{ padding: `0 ${props.sapceHorizontal}px` }}
          >
            {renderList(props.skelectonCount, (item, index) => {
              return renderSlot(context.slots, "skelecton", { item, index }, () => [
                <div class="r-c-skelectons-item r-skelectons-item"> </div>,
              ]);
            })}
          </div>,
        ])}
      </div>
    );
  }

  function renderContent(vNode) {
    if (loadHook.loading) return null;
    if (loadHook.begin) return null;
    return vNode;
  }

  return {
    renderContent,
    renderBegin,
    renderLoading,
    renderfinished,
    renderEmpty,
    renderError,
    setRelative,
    setParentHtml,
  };
}

export function useListLoadingHoc(aaaaa, props, context, configs = {}) {
  const loadHook = useLoading({ ...props, promiseHook: props.listHook });

  function renderLoading() {
    if (props.listHook.finished) return null;
    if (props.listHook.error) return null;
    if (!props.loadingText) return null;
    const loadingVnode = renderSlot(context.slots, "loading", props.listHook, () => [
      <div class={["r-c-loading r-loading"]}>
        <RILoading class="r-c-loading-icon r-loading-icon" />
        <div class={["r-c-loading-text r-loading-text"]}>{props.loadingText}</div>
      </div>,
    ]);

    if (!props.loadText) {
      return loadingVnode;
    }

    if (loadHook.loading) {
      return loadingVnode;
    }

    return renderSlot(context.slots, "load", props.listHook, () => [
      <div class={["r-c-load r-load"]}>
        <div onClick={() => context.emit("loadClick")} class={["r-c-load-text r-load-text"]}>
          {props.loadText}
        </div>
      </div>,
    ]);
  }

  function renderfinished() {
    if (loadHook.loading) return null;
    if (!props.listHook.finished) return null;
    if (!props.listHook.list || !props.listHook.list.length) return null;
    if (!props.finishedText) return null;
    return renderSlot(context.slots, "finished", props.listHook, () => [
      <div class="r-c-finished r-finished">{props.finishedText}</div>,
    ]);
  }

  function renderEmpty() {
    if (loadHook.loading) return null;
    if (!props.listHook.finished) return null;
    if (props.listHook?.list?.length) return null;
    if (!props.emptyText && !props.emptySrc) return null;
    return renderSlot(context.slots, "empty", props.listHook, () => [
      <div class="r-c-empty r-empty">
        {renderSlot(context.slots, "emptyImg", props.listHook, () => [
          props.emptySrc && (
            <img class={"r-c-empty-img r-empty-img"} fit="contain" src={props.emptySrc} />
          ),
        ])}
        {props.emptyText && <div class={"r-c-empty-text r-empty-text"}>{props.emptyText}</div>}
      </div>,
    ]);
  }

  function renderError() {
    if (loadHook.loading) return null;
    if (!props.listHook.error) return null;
    return renderSlot(context.slots, "error", props.listHook, () => [
      <div class="r-c-error r-error" onClick={() => context.emit("errorClick")}>
        <div class="r-c-error-text r-error-text">{props.errorText}</div>
      </div>,
    ]);
  }

  function renderBegin(config = {}) {
    const { itemNode = null, space = 0, column = 1, height = 100 } = config;
    if (!loadHook.begin) return null;
    return (
      <div class="r-c-begin r-begin">
        {renderSlot(context.slots, "begin", props.listHook, () => [
          <div
            class="r-c-begin-skelectons r-begin-skelectons"
            style={{ "grid-template-columns": `repeat(${column}, 1fr)`, "grid-gap": `${space}px` }}
          >
            {renderList(props.skelectonCount, (item, index) => {
              return [
                renderSlot(context.slots, "skelecton", { item, index }, () => [
                  itemNode || (
                    <div
                      style={{ height: height + "px" }}
                      class="r-c-begin-skelecton r-begin-skelecton"
                    ></div>
                  ),
                ]),
              ];
            })}
          </div>,
        ])}
      </div>
    );
  }

  function renderContent(vNode) {
    if (loadHook.begin) return null;
    return vNode;
  }

  return { renderLoading, renderBegin, renderfinished, renderEmpty, renderError, renderContent };
}

export const RListLoading = defineComponent({
  props: loadingProps,
  setup(props, context) {
    const loadComs = useLoadingHoc(props, context);
    return () => {
      return [
        loadComs.renderContent(renderSlot(context.slots, "default")),
        loadComs.renderError(),
        loadComs.renderLoading(),
        loadComs.renderBegin({
          height: props.avgHeight,
          space: props.space,
          column: props.columnNum,
        }),
        loadComs.renderfinished(),
        loadComs.renderEmpty(),
      ];
    };
  },
});

export const RLoading = defineComponent({
  props: {
    loadingHook: {
      type: Object,
      default: () => ({}),
    },
    skelectonCount: {
      type: Number,
      default: 10,
    },
    loadingClass: String,
    skelectonClass: String,
    slots: Object,
  },
  setup(props, context) {
    return () => {
      const SLOTS = props.slots || context.slots;
      if (props.loadingHook.begin === true) {
        if (SLOTS?.begin) return SLOTS.begin();
        return [
          <div class={["r-loading", props.loadingClass]}>
            {props.skelectonCount
              ? renderList(props.skelectonCount, (item, index) => {
                  return (
                    <div key={index} class="r-loading-skelecton-item">
                      {renderSlot(SLOTS, "skelecton", props.loadingHook, () => [<RILoading />])}
                    </div>
                  );
                })
              : renderSlot(SLOTS, "loading", props.loadingHook, () => [<RILoading />])}
          </div>,
        ];
      }
      return renderSlot(context.slots, "default");
    };
  },
});

export const RLoadings = defineComponent({
  props: {
    loadingHook: {
      type: [Object, Array],
      default: () => ({}),
    },
    promiseHook: {
      type: [Object, Array],
      default: () => ({}),
    },
    parentHtml: HTMLElement,
  },
  setup(props, context) {
    // eslint-disable-next-line
    // const { loadingHook, promiseHook } = props;

    const isLoading = computed(() => {
      const loadings = [];

      if (props.promiseHook instanceof Array) loadings.push(...props.promiseHook);
      else loadings.push(props.promiseHook);

      if (props.loadingHook instanceof Array) loadings.push(...props.loadingHook);
      else loadings.push(props.loadingHook);

      const load = loadings.some((el) => el?.loading === true);
      return load;
    });

    const isError = computed(() => {
      const errors = [];
      if (props.promiseHook instanceof Array) errors.push(...props.promiseHook);
      else errors.push(props.promiseHook);
      const error = errors.some((el) => el?.error === true);
      return error;
    });

    function setRelative(bool = true) {
      props.parentHtml.setAttribute("data-relative", bool);
    }

    return () => {
      if (isLoading.value) {
        setRelative(true);
        return (
          <div class={["r-loadings"]}>
            <RILoading class="r-loadings-icon" />
            <div class={["r-loadings-text"]}>正在加载中</div>
          </div>
        );
      }

      if (isError.value) {
        setRelative(true);
        return (
          <div class={["r-loadings"]}>
            <div class={["r-loadings-error-text"]}>出错了</div>
          </div>
        );
      }

      setRelative(false);
      return renderSlot(context.slots, "default");
    };
  },
});

export const directiveLoading = {
  install(app, options) {
    app.directive("loadings", {
      created(el, binding, vnode, prevVnode) {
        el.__loadingHook = binding.value;
        // console.log("loadings", [el]);
        render(
          <RLoadings
            key="loadings"
            promiseHook={el.__promiseHook}
            loadingHook={el.__loadingHook}
            parentHtml={el}
          />,
          el
        );
      },
    });
  },
};

export const directivepromise = {
  install(app, options) {
    app.directive("promise", {
      created(el, binding, vnode, prevVnode) {
        el.__promiseHook = binding.value;
        // console.log("promise", [el]);
        render(
          <RLoadings
            key="promise"
            promiseHook={el.__promiseHook}
            loadingHook={el.__loadingHook}
            parentHtml={el}
          />,
          el
        );
      },
    });
  },
};
