import { defineComponent } from "vue";

export const RFlexHoc = (optinos = {}) => {
    const config = {
        className: "r-row",
        reverseClassName: "r-row-reverse",
        props:{},
        ...optinos
    }

    return defineComponent({
        props: {
            reverse: Boolean,
            wrap: Boolean,
            justify: { type: String, default: "" },
            align: { type: String, default: "" },
            alignSelf: { type: String, default: "" },
            auto: { type: [String, Boolean], default: "" },
            fill: Boolean,
            ...config.props,
        },

        setup(props, context) {
            return () => {
                return (
                    <div
                        class={[
                            config.className,
                            props.reverse && config.reverseClassName,
                            props.wrap && "r-flex-wrap",
                            props.justify && `r-flex-justify-${props.justify}`,
                            props.align && `r-flex-align-${props.align}`,
                            props.auto && `r-flex-justify-auto-${props.auto}`,
                            props.alignSelf && `r-flex-align-self-${props.alignSelf}`,
                            props.fill && "r-flex-fill",
                        ]}
                    >
                        {context.slots?.default?.()}
                    </div>
                );
            };
        },
    });
}  
