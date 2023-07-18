import { defineComponent, h, ref, watch } from "vue";
import {
  ElTable,
  ElEmpty,
  ElSkeleton,
  ElResult,
  ElPagination,
  paginationProps,
  ElTableColumn,
} from "element-plus";
import elTableProps from "element-plus/es/components/table/src/table/defaults.mjs";
import "./index.scss";

const defaultProps = {
  ...elTableProps,
  //////
  calcHeight: Number,
  calcMaxHeight: Number,
};

const loadingProps = {
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: true,
  },
  finished: {
    type: Boolean,
    default: false,
  },
  begin: {
    type: Boolean,
    default: false,
  },
  data: {
    type: [Array, Object, Number, String],
    default: () => [],
  },
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
    default: "前方网络有毒 请点击重试",
  },
  finishedText: {
    type: String,
    default: "没有更多的了",
  },
  setTotal: {
    type: Function,
    default(res) {
      if (!res) return 0;
      if (res instanceof Array) return res.length;
      return res.total;
    },
  },
  list: {
    type: [Array, Object, Number, String],
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  setList: {
    type: Function,
    default(res) {
      if (!res) return [];
      if (res instanceof Array) return res;
      return res.list || [];
    },
  },
  setFinished: {
    type: Function,
    default(listData, total, list) {
      return listData.length >= total;
    },
  },
};

const loadingEmits = [
  "errorClick",
  "update:currentPage",
  "update:pageSize",
  "size-change",
  "current-change",
  "prev-click",
  "size-change",
  "page-change",
];

ElTable.inheritAttrs = false;
paginationProps.inheritAttrs = false;

export const TableHoc = (option = {}) => {
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
            context.emit("errorClick");
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
    inheritAttrs: false,
    ...option,
  };
  return defineComponent({
    props: {
      ...paginationProps,
      ...defaultProps,
      ...loadingProps,
      checkList: {
        type: Array,
        default: () => [],
      },
      formatterId: {
        type: Function,
        default: (item) => {
          return item && item.id;
        },
      },
      modelValue: {
        type: Array,
        default: () => [],
      },
      ...config.props,
    },
    inheritAttrs: config.inheritAttrs,
    emits: [
      ...loadingEmits,
      "select",
      "update:checkList",
      "select-all",
      "update:modelValue",
      "selection-change",
      ...config.emits,
    ],
    setup(props, context) {
      // console.log("props", props);
      // console.log("context", context);

      const bool0 = (val) => val === 0 || val;
      const pageSize = ref(props.pageSize);
      const currentPage = ref(props.currentPage);
      const checkList = ref(props.checkList);

      watch(
        () => props.pageSize,
        (val) => {
          pageSize.value = val;
        }
      );

      watch(
        () => props.currentPage,
        (val) => {
          currentPage.value = val;
        }
      );

      watch(
        () => props.list,
        (val) => {
          checkList.value = [];
          context.emit("update:checkList", []);
          context.emit("update:modelValue", []);
        }
      );

      // eslint-disable-next-line
      let maxHeight = props.maxHeight;
      if (bool0(props.calcMaxHeight)) {
        maxHeight = window.innerHeight - props.calcMaxHeight + "px";
      }
      // eslint-disable-next-line
      let height = props.height;
      if (bool0(props.calcHeight)) {
        height = window.innerHeight - props.calcHeight + "px";
      }

      return (VM, _cache) => {
        // console.log("VM", VM);
        return (
          <div class={["lib-table", config.class]}>
            {props.loading && !props.begin && (
              <div class={["lib-loading"]}>
                {context?.slots?.loading?.() || config.renderLoading(props, context, VM)}
              </div>
            )}
            <ElTable
              {...props}
              {...context.attrs}
              maxHeight={maxHeight}
              height={height}
              ref={"elTable"}
              data={props.list}
              onSelect={(list, ...arg) => {
                checkList.value = list;
                context.emit("select", list, ...arg);
                context.emit("update:checkList", list);
                context.emit(
                  "update:modelValue",
                  list.map((el) => props.formatterId(el))
                );
              }}
              onSelect-all={(list, ...arg) => {
                checkList.value = list;
                context.emit("select-all", list, ...arg);
                context.emit("update:checkList", list);
                context.emit(
                  "update:modelValue",
                  list.map((el) => props.formatterId(el))
                );
              }}
              onSelection-change={(list, ...arg) => {
                checkList.value = list;
                context.emit("selection-change", list, ...arg);
                context.emit("update:checkList", list);
                context.emit(
                  "update:modelValue",
                  list.map((el) => props.formatterId(el))
                );
              }}
            >
              {{
                ...context.slots,
                empty: () => {
                  if (props.error) {
                    return context?.slots?.error?.() || config.renderError(props, context, VM);
                  }

                  if (props.begin) {
                    return context?.slots?.begin?.() || config.renderBegin(props, context, VM);
                  }

                  return context?.slots?.empty?.() || config.renderEmpty(props, context, VM);
                },
                // append: () =>{
                // },
              }}
            </ElTable>
            {h(ElPagination, {
              layout: "total, sizes, prev, pager, next, jumper",
              ...context.attrs,
              total: props.total,
              "current-page": currentPage.value,
              "page-size": pageSize.value,
              "onUpdate:current-page": (v) => {
                currentPage.value = v;
                context.emit("update:currentPage", v);
              },
              "onUpdate:page-size": (v) => {
                pageSize.value = v;
                context.emit("update:pageSize", v);
              },
              onSizeChange: (...v) => {
                context.emit("size-change", ...v);
                context.emit("page-change", currentPage.value, pageSize.value);
              },
              onCurrentChange: (...v) => {
                context.emit("current-change", ...v);
                context.emit("page-change", currentPage.value, pageSize.value);
              },
              onPrevClick: (...v) => {
                context.emit("prev-click", ...v);
                context.emit("page-change", currentPage.value, pageSize.value);
              },
              onNextClick: (...v) => {
                context.emit("size-change", ...v);
                context.emit("page-change", currentPage.value, pageSize.value);
              },
            })}
          </div>
        );
      };
    },
  });
};

export const Table = TableHoc();
export * from "./tableColumn";
