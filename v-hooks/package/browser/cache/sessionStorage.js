import {
  defineComponent,
  renderSlot,
  computed,
  onMounted,
  onBeforeUnmount,
  inject,
  reactive,
  ref,
  customRef,
  watch,
  isRef,
} from "vue";

// export function useSessionStorageRef(key, defaultValue) {
//   window.addEventListener("storage", onStorageChange);
//   const storageStr = window.sessionStorage.getItem(key);
//   const storageVal = (() => {
//     if (storageStr === "undefined") return undefined;
//     if (storageStr === null) {
//       if (defaultValue !== undefined) {
//         window.sessionStorage.setItem(key, JSON.stringify(defaultValue));
//       }
//       return defaultValue;
//     }
//     return JSON.parse(storageStr);
//   })();

//   const val = ref(storageVal);

//   function onStorageChange(event) {
//     if (event.key !== key) return;
//     const str = window.sessionStorage.getItem(key);
//     const sv = (() => {
//       if (str === "undefined") return undefined;
//       return JSON.parse(str);
//     })();
//     val.value = sv;
//   }

//   watch(
//     val,
//     (newValue) => {
//       const newVal = isRef(newValue) ? newValue.value : newValue;
//       window.sessionStorage.setItem(key, JSON.stringify(newVal));
//     },
//     { deep: true }
//   );

//   return val;
// }
