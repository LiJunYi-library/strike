import {
  defineComponent,
  renderList,
  renderSlot,
  computed,
  watch,
  onMounted,
  ref,
  render,
  nextTick,
  withMemo,
  isMemoSame,
} from "vue";

export const directiveIntersectionObserver = {
  install(app) {
    app.directive("intersection", {
      created(el, binding, vnode, prevVnode) {
        el.directiveIntersectionObserver = {
          isFirstVisible: true,
        };

        const options = {
          threshold: ("0." + binding.arg) * 1 || 0.4,
        };
        const ctx = el.directiveIntersectionObserver;
        const funName = [
          binding.modifiers.first && "first",
          binding.modifiers.show && "show",
          binding.modifiers.hide && "hide",
        ]
          .filter(Boolean)
          .join("");

        const funs = {
          "": (entrie) => {
            binding.value(entrie);
          },
          show(entrie) {
            if (entrie.isIntersecting) {
              binding.value(entrie);
            }
          },
          firstshow(entrie) {
            if (entrie.isIntersecting && ctx.isFirstVisible) {
              binding.value(entrie);
              ctx.isFirstVisible = false;
            }
          },
          hide(entrie) {
            if (!entrie.isIntersecting) {
              binding.value(entrie);
            }
          },
          firsthide(entrie) {
            if (!entrie.isIntersecting && ctx.isFirstVisible) {
              binding.value(entrie);
              ctx.isFirstVisible = false;
            }
          },
        };

        function observerCB(entries) {
          entries.forEach((entrie) => {
            if (binding.value instanceof Function) {
              funs[funName](entrie);
              return;
            }
          });
        }

        try {
          el.directiveIntersectionObserver.observer = new IntersectionObserver(observerCB, options);
        } catch (error) {
          console.error(error);
        }
        const { observer } = el.directiveIntersectionObserver;
        if (el) observer?.observe?.(el);
      },
      beforeUnmount(el, binding, vnode, prevVnode) {
        const { observer } = el.directiveIntersectionObserver;
        observer?.disconnect?.();
      },
    });
  },
};
