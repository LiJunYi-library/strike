export * from "./radio";
import { arrayRemove } from "@rainbow_ljy/rainbow-js";
import { useRadio, useMultiple, useSelect2 } from "@rainbow_ljy/v-hooks";
import { reactive, ref, onBeforeUnmount } from "vue";

export function useTree(props = {}, defProps = {}, checkProps = {}) {
  const config = {
    formatterValue: (item) => item?.value,
    formatterLabel: (item) => item?.label,
    formatterChildren: (item) => item?.children,
    formatterDisabled: (item) => item?.disabled ?? false,
    ...props,
    tree: props.tree || [],
  };

  const defConfig = {
    // isMultiple: true,
    ...config,
    ...defProps,
  };

  const checkConfig = {
    isMultiple: true,
    ...config,
    ...checkProps,
  };

  const { formatterValue, formatterLabel, formatterChildren, formatterDisabled } = config;

  const value = ref([]);
  const label = ref([]);
  const parms = reactive({
    hook: undefined,
    checkHook: undefined,
    value,
    label,
    formatterValue,
    formatterLabel,
    formatterChildren,
    formatterDisabled,
    // updateTree,
    // getValues,
    // reset,
    // save_changeContextToStore,
    // restore_changeContextToProxy,
    // changeContextToProxy,
  });
  initTree(config.tree);

  function initTree(treeData) {
    const mTree = JSON.parse(JSON.stringify(treeData));
    (function fun(list) {
      if (!list) return;
      list.forEach((el, index) => {
        const newItem = { ...el };
        const children = formatterChildren(newItem);
        if (children) {
          newItem.hook = useSelect2({ ...defConfig, list: children });
          newItem.checkHook = useSelect2({ ...checkConfig, list: children });
          fun(children);
        }
        list[index] = newItem;
      });
    })(mTree);
    parms.hook = useSelect2({ ...defConfig, list: mTree });
    parms.checkHook = useSelect2({ ...checkConfig, list: mTree });
    // resetAndCheckFirst();
    return mTree;
  }

  function recursion(hoks, cb) {
    if (!hoks) return;
    if (!hoks.hook) return;
    if (cb) cb(hoks);
    hoks.hook.list.forEach((hok) => {
      recursion(hok, cb);
    });
  }

  function recursionMap(hoks, cb, con = []) {
    if (!hoks) return con;
    if (!hoks.hook) return con;
    if (cb) cb(hoks, con);
    hoks.hook.list.forEach((hok) => {
      return recursionMap(hok, cb, con);
    });
    return con;
  }

  function resetAndCheckFirst() {
    recursion(parms, (ele) => {
      ele.hook.updateIndex(0);
      ele.checkHook.reset();
    });
  }

  // function updateTree(tree) {
  //   const nTree = JSON.parse(JSON.stringify(tree));
  //   fun(nTree);
  //   parms.hook = useSelect2({ list: nTree, ...listProps }).proxy;
  //   parms.checkHook = useSelect2({ list: nTree, ...listProps }).proxy;
  //   reset();
  // }

  // function save_changeContextToStore() {
  //   recursion(parms, (ele) => {
  //     ele.hook.save_changeContextToStore();
  //     ele.checkHook.save_changeContextToStore();
  //   });
  // }

  // function restore_changeContextToProxy() {
  //   recursion(parms, (ele) => {
  //     ele.hook.restore_changeContextToProxy();
  //     ele.checkHook.restore_changeContextToProxy();
  //   });
  // }

  // function changeContextToProxy() {
  //   recursion(parms, (ele) => {
  //     ele.hook.changeContextToProxy();
  //     ele.checkHook.changeContextToProxy();
  //   });
  // }

  // function getValues() {
  //   const values = recursionMap(parms, (ele, con) => {
  //     con.push(ele.checkHook.value);
  //   });
  //   const labels = recursionMap(parms, (ele, con) => {
  //     con.push(ele.checkHook.label);
  //   });
  //   value.value = values.flat();
  //   label.value = labels.flat();
  // }

  return parms;
}
