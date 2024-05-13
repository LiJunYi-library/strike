import { defineComponent } from "vue";

export const RColumn = defineComponent({
  props: {
    reverse: Boolean,
    wrap: Boolean,
    justify: { type: String, default: "start" }, //start end  around  between  evenly  center stretch
    align: { type: String, default: "start" }, //start   end center stretch  baseline
    auto: { type: [String, Boolean], default: "" }, //left   right  center ""
    fill: Boolean,
  },

  setup(props, context) {
    return () => {
      return (
        <div
          class={[
            "r-column",
            props.reverse && "r-column-reverse",
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
