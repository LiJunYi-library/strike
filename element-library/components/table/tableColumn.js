import { defineComponent, h, ref, watch } from "vue";
import { ElTableColumn, ElButton, ElText, ElLink, ElImage, ElPopover } from "element-plus";
import { objectFilter } from "@rainbow_ljy/rainbow-js";

ElTableColumn.inheritAttrs = false;

export function TableColumnHoc(options = {}) {
  const config = {
    props: {},
    class: "",
    emits: [],
    inheritAttrs: false,
    renderDefault: () => null,
    renderHeader: null,
    ...options,
  };
  return defineComponent({
    props: {
      ...ElTableColumn.props,
      align: {
        type: String,
        default: "center",
      },
      "header-align": {
        type: String,
        default: "center",
      },
      ...config.props,
    },
    emits: [...config.emits],
    setup(props, context) {
      const _arguments = { props, context };
      _arguments.getValue = (scop) => {
        const { row, column, $index } = scop;
        const cellValue = row[column.property];
        if (column.formatter) return column.formatter(row, column, cellValue, $index);
        return cellValue;
      };

      return (vm) => {
        // console.log("ElTableColumnvm", vm);
        _arguments.vm = vm;
        return (
          <ElTableColumn {...props} {...context.attrs} class={[config.class]}>
            {{
              header: (() => {
                if (config.renderHeader || context.slots.header) {
                  return (...arg) => {
                    return (
                      config?.renderHeader?.(_arguments, ...arg) || context.slots?.header?.(...arg)
                    );
                  };
                }
                return null;
              })(),

              default: (scop, ...arg) => {
                _arguments.cellValue = _arguments.getValue(scop);
                return (
                  config.renderDefault(_arguments, scop, ...arg) ||
                  context.slots?.default?.(scop, ...arg)
                );
              },
            }}
          </ElTableColumn>
        );
      };
    },
  });
}
/** */
export const TableColumn = TableColumnHoc();
/** */
export const TableColumnOptions = TableColumnHoc({});
TableColumnOptions.props.label = {
  type: String,
  default: "操作",
};
TableColumnOptions.props.width = {
  type: [String, Number],
  default: "120",
};
TableColumnOptions.props.fixed = {
  type: [String, Number],
  default: "right",
};
/** */
export const TableColumnButton = TableColumnHoc({
  renderDefault({ props, context, vm, cellValue }, arg) {
    const attrs = objectFilter(context.attrs, /button_/g);
    return (
      <ElButton
        onClick={(event) => {
          event.stopPropagation();
          context.emit("click", cellValue, arg);
        }}
        {...attrs}
      >
        {context.slots?.default?.(arg) || cellValue}
      </ElButton>
    );
  },
  emits: ["click"],
});
/** */
export const TableColumnText = TableColumnHoc({
  renderDefault({ props, context, vm, cellValue }, arg) {
    const attrs = objectFilter(context.attrs, /text_/g);
    return (
      <ElText
        onClick={(event) => {
          event.stopPropagation();
          context.emit("click", cellValue, arg);
        }}
        {...attrs}
      >
        {context.slots?.default?.(arg) || cellValue}
      </ElText>
    );
  },
  emits: ["click"],
});
/** */
export const TableColumnLink = TableColumnHoc({
  renderDefault({ props, context, vm, cellValue }, arg) {
    const attrs = objectFilter(context.attrs, /link_/g);
    const href = attrs?.href || arg.row?.[attrs?.url] || cellValue;
    return (
      <ElLink
        onClick={(event) => {
          event.stopPropagation();
          context.emit("click", cellValue, arg);
        }}
        target="blank"
        type="primary"
        {...attrs}
        href={href}
      >
        {{
          icon: (...aeg) => context.slots?.icon?.(arg),
          default: (...aeg) => context.slots?.default?.(arg) || cellValue,
        }}
      </ElLink>
    );
  },
  emits: ["click"],
});
/** */
export const TableColumnImg = TableColumnHoc({
  props: {},
  renderDefault({ props, context, vm, cellValue }, arg) {
    // console.log(vm.$parent.scrollTo);
    const attrs = objectFilter(context.attrs, /img_/g);
    const imgList = vm.$parent.data.map((el) => el.img);
    const popoverAttrs = objectFilter(context.attrs, /popover_/g);
    const pWidth = popoverAttrs.width || 500;
    return (
      <ElPopover placement="right" {...popoverAttrs} width={pWidth * 1 + 30}>
        {{
          default: () => (
            <ElImage
              fit="contain"
              src={cellValue}
              style={{ width: pWidth + "px", height: pWidth + "px" }}
            ></ElImage>
          ),
          reference: () => {
            return (
              <ElImage
                preview-teleported={true}
                fit="contain"
                style={`width: ${props.width - 25}px; height: ${props.width - 25}px`}
                src={cellValue}
                zoom-rate={1.2}
                initial-index={arg.$index}
                preview-src-list={imgList}
                onClick={(event) => {
                  event.stopPropagation();
                  context.emit("click", cellValue, arg);
                }}
                onSwitch={(num) => {
                  const con = vm.$parent.$el.getElementsByClassName("el-table__body-wrapper")?.[0];
                  if (!con) return;
                  const body = con.getElementsByTagName("tbody")?.[0];
                  if (!body) return;
                  const row = body.children[num];
                  row.scrollIntoView(true);
                }}
                {...attrs}
              >
                {{
                  placeholder: (...aeg) => context.slots?.icon?.(arg),
                  error: (...aeg) => context.slots?.default?.(arg),
                  viewer: (...aeg) => context.slots?.default?.(arg),
                }}
              </ElImage>
            );
          },
        }}
      </ElPopover>
    );
  },
  emits: ["click"],
});
TableColumnImg.props.width = {
  type: [String, Number],
  default: "100",
};
/** */
