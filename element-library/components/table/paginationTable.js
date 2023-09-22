import { defineComponent, h, computed, renderSlot, reactive } from "vue";
import {
  ElTable,
  ElEmpty,
  ElSkeleton,
  ElResult,
  ElPagination,
  paginationProps,
} from "element-plus";
import elTableProps from "element-plus/es/components/table/src/table/defaults.mjs";
import "./index.scss";

const defaultProps = {
  ...elTableProps,
  //////
  calcHeight: Number,
  calcMaxHeight: Number,
  ascendingKey: {
    type: String,
    default: "ascending",
  },
  descendingKey: {
    type: String,
    default: "descending",
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
};

const loadingProps = {
  emptyText: {
    type: String,
    default: "暂无数据",
  },
  beginText: {
    type: String,
    default: "玩命加载中",
  },
  loadingText: {
    type: String,
    default: "玩命加载中",
  },
  errorText: {
    type: String,
    default: "前方网络拥堵 请点击重试",
  },
  finishedText: {
    type: String,
    default: "没有更多的了",
  },
};

ElTable.inheritAttrs = false;
paginationProps.inheritAttrs = false;

export const PaginationTableHoc = (option = {}) => {
  const config = {
    renderBegin: (props, context, VM) => {
      return [props.beginText, <ElSkeleton rows={4} animated></ElSkeleton>];
    },
    renderEmpty: (props, context, VM) => {
      return <ElEmpty description={props.emptyText}></ElEmpty>;
    },
    renderError: (props, context, VM) => {
      return (
        <ElResult
          icon="error"
          title={props.errorText}
          onClick={(event) => {
            event.stopPropagation();
            if (context.attrs.errorClick) {
              context.attrs.errorClick();
            } else {
              props?.listHook?.fetch();
            }
          }}
        ></ElResult>
      );
    },
    renderLoading: (props, context, VM) => {
      return (
        <span>
          {props.loadingText}
          <i class="el-icon is-loading">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path
                fill="currentColor"
                d="M512 64a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32zm0 640a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V736a32 32 0 0 1 32-32zm448-192a32 32 0 0 1-32 32H736a32 32 0 1 1 0-64h192a32 32 0 0 1 32 32zm-640 0a32 32 0 0 1-32 32H96a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32zM195.2 195.2a32 32 0 0 1 45.248 0L376.32 331.008a32 32 0 0 1-45.248 45.248L195.2 240.448a32 32 0 0 1 0-45.248zm452.544 452.544a32 32 0 0 1 45.248 0L828.8 783.552a32 32 0 0 1-45.248 45.248L647.744 692.992a32 32 0 0 1 0-45.248zM828.8 195.264a32 32 0 0 1 0 45.184L692.992 376.32a32 32 0 0 1-45.248-45.248l135.808-135.808a32 32 0 0 1 45.248 0zm-452.544 452.48a32 32 0 0 1 0 45.248L240.448 828.8a32 32 0 0 1-45.248-45.248l135.808-135.808a32 32 0 0 1 45.248 0z"
              ></path>
            </svg>
          </i>
        </span>
      );
    },
    props: {},
    class: "",
    emits: [],
    tableAttrs: {},
    paginationAttrs: {},
    inheritAttrs: false,
    ...option,
  };
  return defineComponent({
    props: {
      ...paginationProps,
      ...defaultProps,
      ...loadingProps,
      listHook: Object,
      ...config.props,
    },
    inheritAttrs: config.inheritAttrs,
    emits: [
      "size-change",
      "page-change",
      "sort-change",
      "current-change",
      "prev-click",
      "next-click",
      "select",
      "select-all",
      "selection-change",
      ...config.emits,
    ],
    setup(props, context) {
      const parseOrder = {};
      parseOrder[props.ascendingKey] = "ascending";
      parseOrder[props.descendingKey] = "descending";
      const transformOrder = {
        ascending: props.ascendingKey,
        descending: props.descendingKey,
      };

      const bool0 = (val) => val === 0 || val;

      const maxHeight = computed(() => {
        if (bool0(props.calcMaxHeight)) return window.innerHeight - props.calcMaxHeight + "px";
        return props.maxHeight;
      });

      const height = computed(() => {
        if (bool0(props.calcHeight)) return window.innerHeight - props.calcHeight + "px";
        return props.height;
      });

      // eslint-disable-next-line
      const { listHook } = props;

      let elTable;

      context.expose(elTable);

      const defaultSort = (() => {
        const mOrder = listHook.order ? parseOrder[listHook.order] : null;
        return reactive({
          prop: listHook.prop,
          order: mOrder,
        });
      })();

      let isElTableSort = false;
      listHook.elTableSort = (prop, order, ...arg) => {
        const mOrder = order ? parseOrder[order] : null;
        isElTableSort = true;
        listHook.prop = prop;
        listHook.order = order;
        elTable?.sort?.(prop, mOrder, ...arg);
      };

      return (VM, _cache) => {
        return (
          <div class={["lib-table", config.class]}>
            {listHook.loading && !listHook.begin && (
              <div class={["lib-loading"]}>
                {context?.slots?.loading?.() || config.renderLoading(props, context, VM)}
              </div>
            )}
            <ElTable
              {...config.tableAttrs}
              {...props}
              {...context.attrs}
              default-sort={defaultSort}
              maxHeight={maxHeight.value}
              height={height.value}
              ref={(el) => {
                elTable = el;
              }}
              data={listHook.list}
              onSelect={(list, ...arg) => {
                context.emit("select", list, ...arg);
                // console.log("select", list, ...arg);
              }}
              onSelect-all={(list, ...arg) => {
                context.emit("select-all", list, ...arg);
                // console.log("select-all", list, ...arg);
              }}
              onSelection-change={(list, ...arg) => {
                context.emit("selection-change", list, ...arg);
                // console.log("selection-change", list, ...arg);
                listHook?.updateSelect?.(list);
              }}
              onSort-change={({ column, prop, order }) => {
                const mOrder = order ? transformOrder[order] : null;
                // console.log(prop, mOrder);
                if (isElTableSort) {
                  isElTableSort = false;
                  return;
                }

                listHook?.updateProp(prop);
                listHook?.updateOrder(mOrder);
                context.emit("sort-change", { column, prop, order: mOrder });
              }}
            >
              {{
                ...context.slots,
                empty: () => {
                  if (listHook.error === true) {
                    return context?.slots?.error?.() || config.renderError(props, context, VM);
                  }

                  if (listHook.begin === true) {
                    return context?.slots?.begin?.() || config.renderBegin(props, context, VM);
                  }

                  return context?.slots?.empty?.() || config.renderEmpty(props, context, VM);
                },
                append: () => {
                  renderSlot(context.slots, "append");
                },
              }}
            </ElTable>
            {props.showPagination &&
              h(ElPagination, {
                inheritAttrs: false,
                layout: "total, sizes, prev, pager, next, jumper",
                ...config.paginationAttrs,
                ...context.attrs,
                total: listHook.total,
                "current-page": listHook.currentPage,
                "page-size": listHook.pageSize,
                "onUpdate:current-page": (page, size) => {
                  // console.log("onUpdate:current-page", page, size);
                  listHook.updatePage(page);
                  //
                },
                "onUpdate:page-size": (size, page) => {
                  // console.log("onUpdate:page-size", page, size);
                  listHook.updatePageSize(size);
                  //
                },
                onSizeChange: (...v) => {
                  context.emit("size-change", ...v);
                  context.emit("page-change");
                  // console.log("onSizeChange", ...v);
                },
                onCurrentChange: (...v) => {
                  context.emit("current-change", ...v);
                  context.emit("page-change");
                  // console.log("onCurrentChange", ...v);
                },
                onPrevClick: (...v) => {
                  context.emit("prev-click", ...v);
                  context.emit("page-change");
                  // console.log("onPrevClick", ...v);
                },
                onNextClick: (...v) => {
                  context.emit("next-click", ...v);
                  context.emit("page-change");
                  // console.log("onNextClick", ...v);
                },
              })}
          </div>
        );
      };
    },
  });
};

export const PaginationTable = PaginationTableHoc();
