import { defineComponent, Teleport, reactive, renderSlot } from "vue";
import "./index.scss";
import { useModelWatch } from "@rainbow_ljy/v-hooks";
import { RILoading } from "../icon";

export const RRow = defineComponent({
  props: {
    text: { type: String, default: "" },
    visible: { type: Boolean, default: false },
    showLoadingIcon: { type: Boolean, default: true },
    iconClass: { type: String, default: "" },
  },

  setup(props, context) {
    return () => {
      return <div class={["r-row"]}></div>;
    };
  },
});
