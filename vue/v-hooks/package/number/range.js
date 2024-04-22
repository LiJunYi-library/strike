import { ref, watchEffect } from "vue";
import { useRadio2 } from "../list";
import { useReactive, createSaveContext, mergeSaveContext } from "../../other";

export function useRangeNumber(props = {}) {
  const config = {
    min: "",
    max: "",
    ...props,
  };

  const min = ref(config.min);
  const max = ref(config.max);

  const contextHooks = createSaveContext({ min, max });

  const hooks = useReactive({
    min,
    max,
    updateMin,
    updateMax,
    getValues,
    reset,
    verifyChange,
    ...contextHooks,
  });

  function updateMin(value) {
    hooks.context.SH.min = value;
  }

  function updateMax(value) {
    hooks.context.SH.max = value;
  }

  function getValues() {
    return [hooks.context.SH.min, hooks.context.SH.max];
  }

  function reset() {
    hooks.context.SH.min = "";
    hooks.context.SH.max = "";
  }

  function verifyChange() {
    const { SH } = hooks.context;
    if (SH.min && SH.max && SH.min * 1 > SH.max * 1) {
      const { min: mi, max: ma } = SH;
      SH.min = Math.min(mi, ma);
      SH.max = Math.max(mi, ma);
    }
  }

  return hooks;
}

export function useRangeNumberList(config = {}) {
  const props = {
    formatterMin: (item) => item?.min,
    formatterMax: (item) => item?.max,
    joinStr: "-",
    ...config,
  };

  const radio = useRadio2({
    value: [props.min, props.max].join(props.joinStr),
    formatterValue: (item) =>
      [props.formatterMin(item), props.formatterMax(item)].join(props.joinStr),
    ...props,
  });
  const rang = useRangeNumber({ ...props });
  const contextHooks = mergeSaveContext(rang, radio);

  const hooks = useReactive({
    ...rang.getProto(),
    ...radio.getProto(),
    updateMin,
    updateMax,
    reset,
    verifyChange,
    ...contextHooks,
  });

  let lock = false;

  watchEffect(() => {
    const item = radio?.context?.stores?.select;
    updateMinMax(item);
  });

  watchEffect(() => {
    const item = radio?.context?.states?.select;
    updateMinMax(item);
  });

  function updateMinMax(item) {
    if (lock) return (lock = false);
    const min = props.formatterMin(item);
    const max = props.formatterMax(item);
    if (min === rang.context.SH.min && max === rang.context.SH.max) return;
    rang.updateMin(min);
    rang.updateMax(max);
  }

  function updateMin(value) {
    lock = true;
    rang.updateMin(value);
    radio.updateValue(rang.getValues().join(props.joinStr));
  }

  function updateMax(value) {
    lock = true;
    rang.updateMax(value);
    radio.updateValue(rang.getValues().join(props.joinStr));
  }

  function reset() {
    lock = true;
    rang.reset();
    radio.reset();
  }

  function verifyChange() {
    lock = true;
    rang.verifyChange();
    radio.updateValue(rang.getValues().join(props.joinStr));
  }

  return hooks;
}
