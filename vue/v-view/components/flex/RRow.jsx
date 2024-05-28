import { defineComponent } from "vue";

export const RRow = defineComponent({
  props: {
    reverse: Boolean,
    wrap: Boolean,
    justify: { type: String, default: "" }, //start end  around  between  evenly  center stretch
    align: { type: String, default: "center" }, //start   end center stretch  baseline
    auto: { type: [String, Boolean], default: "" }, //left   right  center ""
    fill: Boolean,
  },

  setup(props, context) {
    return () => {
      return (
        <div
          class={[
            "r-row",
            props.reverse && "r-row-reverse",
            props.wrap && "r-flex-wrap",
            props.justify && `r-flex-justify-${props.justify}`,
            props.align && `r-flex-align-${props.align}`,
            props.auto && `r-flex-justify-auto-${props.auto}`,
            props.fill && "r-flex-fill",
          ]}
        >
          {context.slots?.default?.()}
        </div>
      );
    };
  },
});
