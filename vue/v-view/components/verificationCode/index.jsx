import { defineComponent, renderSlot } from "vue";

export const RVerificationCode = defineComponent({
  props: {
    label: { type: String, default: "获取验证码" },
    timerHook: Object,
  },
  emits: ['getCode'],
  setup(props, context) {
    function onClick(params) {
      props.timerHook.afresh();
      context.emit('getCode')
    }

    function renderC() {
      if (props.timerHook.lock) {
        return <div onClick={onClick} class='label'>
          {context.slots?.label?.() ?? props.label}
        </div>
      }

      return context.slots?.default?.(props.timerHook.num) ?? <div class='num'>{props.timerHook.num}</div>
    }

    return () => {
      return <div class='r-verification-code'>
        {renderC()}
      </div>;
    };
  },
});
