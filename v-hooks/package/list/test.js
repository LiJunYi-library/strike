import { ref, reactive, computed, watch } from "vue";
import { usePromise, getPromiseConfig, useInterceptPromiseApply } from "../promise";
import { List } from "@rainbow_ljy/rainbow-js";

const createObserve = (object = {}) => {
  const obj = {};
  for (const key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      const element = object[key];
      obj[key] = {
        set(v) {
          element.value = v;
        },
        get() {
          return element.value;
        },
      };
    }
  }
  return obj;
};

export function useList(options = {}) {
  const LIST = new List({
    ...options,
    init(obs) {
      const select = ref(obs.select);
      const index = ref(obs.index);
      const value = ref(obs.value);
      const label = ref(obs.label);
      const list = ref(obs.list);
      const data = ref(obs.data);
      const observe = createObserve({ select, index, value, label, list, data });

      console.log("observe", observe);

      return observe;
    },
  });

  // LIST.init()

  console.log("LIST", LIST);

  return LIST;
}

export class Radio {
  constructor(p) {
    const list = ref();
    const select = ref();
    const value = ref();
    const label = ref();
    const index = ref();

    console.log(reactive({ select }));

    // this.list = list;

    // Object.assign(this, reactive({ select }));
    const refs = {
      list,
      select,
      value,
      label,
      index,
    };

    const proxy = reactive({ select, list, value, refs });

    this.list = proxy.list;
  }

  onSelect() {
    //
  }
}



