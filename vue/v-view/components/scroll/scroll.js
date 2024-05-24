import {
    defineComponent,
    renderSlot,
    computed,
    onMounted,
    onBeforeUnmount,
    inject,
    reactive,
    provide,
} from "vue";
import "./index.scss";
import { arrayRemove } from "@rainbow_ljy/rainbow-js";
import { RGlobal } from "../../global";

export class ScrollController {
    onScroll = () => 0;
    onFlotage = () => 0;
    events = [];
    elements = [];
    currentElement = undefined;
    otherElements = [];
    constructor(obj = {}) {
        Object.assign(this, obj);
    }

    scrollAllTop(top) {
        this.elements.forEach((ctx) => {
            ctx.element.scrollTop = top;
        });
    }

    addEvent(eventFun) {
        this.events.push(eventFun);
    }

    removeEvent(eventFun) {
        arrayRemove(this.events, eventFun);
    }

    dispatchScroll(...arg) {
        this.events.forEach((fun) => {
            fun(...arg);
        });
    }

    addElement(ele) {
        this.elements.push(ele);
    }

    setCanScroll(bool) {
        this.elements.forEach((el) => {
            el.setCanScroll(bool);
        });
    }

    removeElement(ele) {
        arrayRemove(this.elements, ele);
    }
}

export function useScrollController(props = {}) {
    const RScrollContext = inject("RScrollContext") || {};
    const controller = reactive({
        onScrollTop: () => undefined,
        onScrollBottom: () => undefined,
        onScrollUp: () => undefined,
        onScrollDown: () => undefined,
        onScroll: () => undefined,
        onScrollend: () => undefined,
        onResize: () => undefined,
        onMounted: () => undefined,
        onFlotage: () => undefined,
        ...props,
        destroy,
        getOffsetTop,
        dispatchFlotage,
        context: RScrollContext,
    });

    RScrollContext?.children?.push?.(controller);

    function getOffsetTop(ele, top = 0) {
        if (!RScrollContext.element) return top;
        if (!ele) return top;
        top = top + ele.offsetTop;
        if (ele.offsetParent === RScrollContext.element) return top;
        return getOffsetTop(ele.offsetParent, top);
    }

    function dispatchFlotage(...arg) {
        RScrollContext.children.forEach((element) => {
            element.onFlotage(...arg);
        });
    }

    function destroy() {
        arrayRemove(RScrollContext?.children, this);
    }

    onBeforeUnmount(() => {
        destroy();
    });

    return controller;
}

export const RScroll = defineComponent({
    props: {
        scrollController: Object,
        popupDisableScroll: { type: Boolean, default: false },
    },
    emits: ["scrollDown", "scrollUp", "scrollChange", "scrollBottom"],
    setup(props, context) {
        const { scrollController: SC } = props;
        const RScrollContext = reactive({
            element: null,
            scrollTop: 0,
            contentElement: null,
            otherElement: [],
            children: [],
            stickys: [],
            isHandActuated: false,
        });
        provide("RScrollContext", RScrollContext);
        let prveTop = 0;
        let scrollTop = 0;
        let resizeObserver;

        try {
            resizeObserver = new ResizeObserver(([entries]) => {
                RScrollContext.children.forEach((el) => {
                    el.onResize(entries, RScrollContext.element.scrollTop);
                });
            });
        } catch (error) {
            //
        }

        function onScroll(event) {
            if (RScrollContext.isHandActuated) {
                RScrollContext.isHandActuated = false;
                return;
            }

            if (SC) SC.currentElement = RScrollContext;

            if (SC) SC.otherElements = SC.elements.filter((el) => el !== SC.currentElement);

            scrollTop = RScrollContext.element?.scrollTop;

            RScrollContext.scrollTop = scrollTop;

            const maxTop = RScrollContext.element?.scrollHeight - RScrollContext.element?.offsetHeight;

            if (scrollTop < 0) scrollTop = 0;

            if (scrollTop > maxTop) scrollTop = maxTop;

            const space = scrollTop - prveTop;

            event.space = space;

            event.scrollTop = scrollTop;

            if (space > 0) {
                RScrollContext.children.forEach((el) => {
                    el.onScrollDown(event, scrollTop);
                });
                context.emit("scrollDown", scrollTop);
            }

            if (space < 0) {
                RScrollContext.children.forEach((el) => {
                    el.onScrollUp(event, scrollTop);
                });
                context.emit("scrollUp", scrollTop);
            }

            RScrollContext.children.forEach((el) => {
                el.onScroll(event, scrollTop);
            });

            handleScrollBottom(event, scrollTop);

            if (SC) SC.dispatchScroll(event);

            context.emit("scrollChange", scrollTop);

            prveTop = scrollTop;
        }

        function onScrollend(event) {
            RScrollContext.children.forEach((el) => {
                el.onScrollend(event, scrollTop);
            });
        }

        function handleScrollBottom(event, STop) {
            if (
                RScrollContext.element.offsetHeight + STop >=
                RScrollContext.contentElement.offsetHeight
            ) {
                RScrollContext.children.forEach((el) => {
                    el.onScrollBottom(event, scrollTop);
                });
                context.emit("scrollBottom", scrollTop);
            }
        }

        RScrollContext.scrollTo = (top, isHandActuated = true) => {
            RScrollContext.isHandActuated = isHandActuated;
            if (typeof top === "number") {
                RScrollContext.element.scrollTop = top;
                scrollTop = top;
                RScrollContext.scrollTop = scrollTop;
                prveTop = top;
            }
            if (typeof top === "object") {
                RScrollContext.element.scrollTo(top);
                prveTop = top.top;
                scrollTop = top.top;
                RScrollContext.scrollTop = scrollTop;
            }
        };

        RScrollContext.scrollAdd = (space, isHandActuated = true) => {
            RScrollContext.isHandActuated = isHandActuated;
            let st = RScrollContext.element.scrollTop + space;
            if (st < 0) st = 0;
            RScrollContext.element.scrollTop = st;
            scrollTop = st;
            prveTop = st;
            RScrollContext.scrollTop = scrollTop;
        };

        RScrollContext.setCanScroll = (bool = true) => {
            RScrollContext.element.setAttribute("data-scroll", bool);
        };

        if (SC) SC.addElement(RScrollContext);

        if (props.popupDisableScroll) RGlobal.scrolls.push(RScrollContext);

        onMounted(() => {
            RScrollContext.children.forEach((el) => {
                el.onMounted(RScrollContext.element.scrollTop);
            });
            resizeObserver?.observe?.(RScrollContext.contentElement);
        });

        onBeforeUnmount(() => {
            arrayRemove(RGlobal.scrolls, RScrollContext);
            if (SC) SC.removeElement(RScrollContext);
            resizeObserver?.disconnect?.();
        });

        function onRef(el) {
            RScrollContext.element = el;
        }

        function onContentRef(el) {
            RScrollContext.contentElement = el;
        }

        return (vm) => {
            return (
                <div ref={onRef} class="r-scroll" onScroll={onScroll} onScrollend={onScrollend}>
                    <div class="r-scroll-content" ref={onContentRef}>
                        {renderSlot(context.slots, "default")}
                    </div>
                </div>
            );
        };
    },
});