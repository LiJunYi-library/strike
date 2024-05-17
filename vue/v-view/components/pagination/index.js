import { defineComponent, renderSlot, watch } from "vue";
import "./index.scss";
import { RTab } from "../tab/tab";
import { useRadio2 } from "@rainbow_ljy/v-hooks";
import { arrayLoopMap } from "@rainbow_ljy/rainbow-js";
import { RRow } from "../flex";

export const RPagination = defineComponent({
  props: {
    name: { type: String, default: "" },
    time: { type: [Number, Boolean], default: false },
    listHook: Object,
  },
  setup(props, context) {
    function getNums() {
      return arrayLoopMap(props.listHook.maxPage, (i) => ({ value: i + 1, label: i + 1 }));
    }

    const select = useRadio2({ list: getNums(), value: props.listHook.currentPage });

    function setSelectValue() {
      if (select.value === props.listHook.currentPage) return;
      select.updateValue(props.listHook.currentPage);
    }

    watch(
      () => props.listHook.total,
      () => {
        select.updateList(getNums());
        setSelectValue();
      },
    );

    watch(() => props.listHook.currentPage, setSelectValue);

    function onChange() {
      props.listHook.updateCurrentPage(select.value);
    }

    function onChangePageSize() {
      props.listHook.updatePageSize(props.listHook.pageSize + 1);
      select.updateList(getNums());
      select.updateValue(props.listHook.currentPage);
    }

    return () => {
      return (
        <div class="r-pagination">
          <RRow wrap={false}>
            <span>{props.listHook.currentPage}</span>
            <span>/{props.listHook.total}</span>
            <span> ({props.listHook.pageSize}) </span>
            <span onclick={onChangePageSize}>add</span>
          </RRow>
          <RTab listHook={select} onChange={onChange}></RTab>
        </div>
      );
    };
  },
});
