
export const loadingProps = {
    finishedText: {
      type: [Number, String],
      default: "没有更多了",
    },
    beginText: {
      type: [Number, String],
      default: "正在加载中",
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
    promiseHook: [Object, Array],
    loadingHook: [Object, Array],
  };