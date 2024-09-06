import { defineComponent, renderSlot } from "vue";
import { useLoading } from "@rainbow_ljy/v-hooks";
import { RILoading } from "../icon";
import { loadingProps } from './com'

function RLoadingHoc(params) {
    const config = {
        props: {},
        emits: [],
        renderError(props, context, asyncHooks) {
            return renderSlot(context.slots, "error", asyncHooks, () => [
                <div class="r-c-error r-error" onClick={() => context.emit("errorClick")}>
                    <div class="r-c-error-text r-error-text">{props.errorText}</div>
                </div>,
            ]);
        },
        renderBegin(props, context, asyncHooks) {
            return renderSlot(context.slots, "begin", asyncHooks, () => [
                <div class="r-c-begin r-begin">
                    <RILoading class="r-c-loading-icon r-loading-icon" />
                    <div class={["r-c-begin-text r-begin-text"]}>{props.beginText}</div>
                </div>,
            ]);
        },
        renderLoading(props, context, asyncHooks) {
            return renderSlot(context.slots, "loading", asyncHooks, () => [
                <div class={["r-c-loading r-loading"]}>
                    <RILoading class="r-c-loading-icon r-loading-icon" />
                    <div class={["r-c-loading-text r-loading-text"]}>{props.loadingText}</div>
                </div>,
            ]);
        },
        renderEmpty(props, context, asyncHooks) {
            if (!props.emptySrc && !props.emptyText) return null;
            return renderSlot(context.slots, "empty", asyncHooks, () => [
                <div class="r-c-empty r-empty">
                    {renderSlot(context.slots, "emptyImg", asyncHooks, () => [
                        props.emptySrc && (
                            <img class={"r-c-empty-img r-empty-img"} fit="contain" src={props.emptySrc} />
                        ),
                    ])}
                    {props.emptyText && <div class={"r-c-empty-text r-empty-text"}>{props.emptyText}</div>}
                </div>,
            ]);
        },
        renderState(props, context, asyncHooks) {
            if (asyncHooks.error) return renderError(props, context, asyncHooks);
            if (asyncHooks.begin) return renderBegin(props, context, asyncHooks);
            if (asyncHooks.loading) return renderLoading(props, context, asyncHooks);
            if (asyncHooks.empty) return renderEmpty(props, context, asyncHooks);
        },
        ...params,

    };

    return defineComponent({
        props: {
            ...loadingProps,
            ...config.props,
        },
        emits: ["errorClick", ...config.emits],
        setup(props, context) {
            const asyncHooks = useLoading(props);
            return () => {
                <div class='r--loading'>
                    {renderSlot(context.slots, "default")}
                    {config.renderState(props, context, asyncHooks)}
                </div>
            };
        },
    });
}

export const RLoading = RLoadingHoc();