import { defineComponent, defineEmits } from "vue";

export const RTimerButtonHoc = (options = {}) => {
  const config = {
    props: {},
    class: '',
    ...options,
  }

  return defineComponent({
    props: {
      timerHook: Object,
      click: Function,
      ...config.props
    },
    setup(props, context) {
      async function onClick(event) {
        event.stopPropagation();
        await context.attrs?.onInlineClick?.(event);
        props.timerHook.afresh();
      }

      function renderC() {
        if (props.timerHook.lock) {
          return <div onClick={onClick} >
            {context.slots?.default?.()}
          </div>
        }

        return context.slots?.num?.(props.timerHook.num) ?? <div class='num'>{props.timerHook.num}</div>
      }

      return () => {
        return <div class={['r-timer-button', config.class]} >
          {renderC()}
        </div>;
      };
    },
  });
}

export const RTimerButton = RTimerButtonHoc()
