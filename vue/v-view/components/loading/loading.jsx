import { defineComponent, renderSlot, onMounted, onBeforeMount } from "vue";
import { useLoading } from "@rainbow_ljy/v-hooks";
import { RILoading } from "../icon";
import { loadingProps } from './com'


function extendsHoc(params, config = {}) {
    let arg = params;
    if (params instanceof Function) arg = params(config);
    Object.assign(config, arg)
    return config;
}

export function RLoadingHoc(params) {
    const config = extendsHoc(params, {
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
            if (asyncHooks.error) return this.renderError(props, context, asyncHooks);
            if (asyncHooks.begin) return this.renderBegin(props, context, asyncHooks);
            if (asyncHooks.loading) return this.renderLoading(props, context, asyncHooks);
            if (asyncHooks.empty) return this.renderEmpty(props, context, asyncHooks);
            return renderSlot(context.slots, "default")
        },
        render(props, context, asyncHooks) {
            return this.renderState(props, context, asyncHooks)
        },
    });


    return defineComponent({
        props: {
            ...loadingProps,
            ...config.props,
        },
        emits: ["loadClick", "errorClick", "intersectionBottom", "firstIntersectionBottom", ...config.emits],
        setup(props, context) {
            let isobserver = false;
            let intersectionHtml;
            const observe = new IntersectionObserver(([entries]) => {
                if (!entries.isIntersecting) return;
                if (!isobserver) context.emit("firstIntersectionBottom");
                if (isobserver) context.emit("intersectionBottom");
                isobserver = true;
            });
            function setIntersectionHtml(el) {
                intersectionHtml = el;
            }
            onMounted(() => {
                if (intersectionHtml) observe.observe(intersectionHtml);
            });
            onBeforeMount(() => {
                observe.disconnect();
            });
            const ctx = { setIntersectionHtml };
            const asyncHooks = useLoading(props);
            return () => config.render(props, context, asyncHooks, ctx);
        },
    });
}

export const RLoading = RLoadingHoc();

export const RLoadingMask = RLoadingHoc((mSuper) => ({
    renderError(props, context, asyncHooks) {
        return (<div class="r-c-error r-error" onClick={() => context.emit("errorClick")}>
            {renderSlot(context.slots, "error", asyncHooks, () => [<div class="r-c-error-text r-error-text">{props.errorText}</div>])}
        </div>);
    },
    renderBegin(props, context, asyncHooks) {
        return (<div class="r-c-begin r-begin">
            {renderSlot(context.slots, "begin", asyncHooks, () => [
                <RILoading class="r-c-loading-icon r-loading-icon" />,
                <div class={["r-c-begin-text r-begin-text"]}>{props.beginText}</div>
            ])}
        </div>);
    },
    renderLoading(props, context, asyncHooks) {
        return (<div class={["r-c-loading r-loading"]}>
            {renderSlot(context.slots, "loading", asyncHooks, () => [
                <RILoading class="r-c-loading-icon r-loading-icon" />,
                <div class={["r-c-loading-text r-loading-text"]}>{props.loadingText}</div>
            ])}
        </div>);
    },
    renderEmpty(props, context, asyncHooks) {
        if (!props.emptySrc && !props.emptyText) return null;
        return <div class="r-c-empty r-empty">
            {renderSlot(context.slots, "empty", asyncHooks, () => [
                renderSlot(context.slots, "emptyImg", asyncHooks, () => [
                    props.emptySrc && (
                        <img class={"r-c-empty-img r-empty-img"} fit="contain" src={props.emptySrc} />
                    ),
                ]),
                props.emptyText && <div class={"r-c-empty-text r-empty-text"}>{props.emptyText}</div>
            ])}
        </div>
    },
    renderState(props, context, asyncHooks) {
        if (asyncHooks.error) return mSuper.renderError(props, context, asyncHooks);
        if (asyncHooks.begin) return mSuper.renderBegin(props, context, asyncHooks);
        if (asyncHooks.loading) return mSuper.renderLoading(props, context, asyncHooks);
        if (asyncHooks.empty) return mSuper.renderEmpty(props, context, asyncHooks);
    },
    render(props, context, asyncHooks) {
        return <div class='r-loading-mask'>
            {renderSlot(context.slots, "default")}
            {this.renderState(props, context, asyncHooks)}
        </div>
    },
}));

export const RLoadingLoad = RLoadingHoc((mSuper) => ({
    renderState(props, context, asyncHooks) {
        if (asyncHooks.error) return mSuper.renderError(props, context, asyncHooks);
        if (asyncHooks.begin) return mSuper.renderBegin(props, context, asyncHooks);
        if (asyncHooks.finished) {
            if (asyncHooks.empty) return mSuper.renderEmpty(props, context, asyncHooks);
            return mSuper.renderfinished(props, context, asyncHooks);
        }
        if (asyncHooks.finished === false) return mSuper.renderLoading(props, context, asyncHooks);
        if (asyncHooks.finished === false) return mSuper.renderLoad(props, context, asyncHooks);
        return null;
    },
    render(props, context, asyncHooks, { setIntersectionHtml }) {
        return [
            !asyncHooks.begin && renderSlot(context.slots, "default"),
            <div class={["r-loading-load", props.className]} >
                <div ref={setIntersectionHtml} class="intersection"></div>
                {this.renderState(props, context, asyncHooks)}
            </div>,
        ]
    },
}));


