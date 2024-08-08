/* eslint-disable import/prefer-default-export */
import {defineComponent, ref, renderSlot, reactive, nextTick, computed, onMounted} from 'vue';

export const AnimationFeedback = defineComponent({
  props: {
    aniClass: {type: [Array, String], default: () => ''},
    isFeedback: {type: Boolean, default: false},
  },
  emits: ['feedbackend', 'feedbackstart', 'animationend'],
  setup(props, context) {
    const aniClass = ref('');
    let node;
    const style = reactive({});

    function onAnimationend(e) {
      aniClass.value = '';
      context.emit('feedbackend');
      context.emit('animationend');
    }

    async function feedback() {
      context.emit('feedbackstart');
      style.animationPlayState = 'paused';
      aniClass.value = '';
      await nextTick();
      setTimeout(() => {
        style.animationPlayState = 'running';
        aniClass.value = props.aniClass;
      }, 0);
    }

    context.expose({feedback});

    function onRef(el) {
      node = el;
    }

    return () => {
      return (
        <div
          style={style}
          ref={onRef}
          class={['r-animation-feedback', aniClass.value]}
          onAnimationend={onAnimationend}>
          {renderSlot(context.slots, 'default')}
        </div>
      );
    };
  },
});
