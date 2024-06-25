import { defineComponent } from "vue";
import { RAbsolute } from '../absolute'
import './index.scss';

export const RNav = defineComponent({
  props: {
    center: [Boolean, String]
  },
  setup(props, context) {
    return (vm) => {
      return <div class={['r-nav']}>
        <div class={['r-nav-content']}>
          <RAbsolute left="0" center='vertical'> {context.slots?.left?.()}</RAbsolute>
          <RAbsolute center> {context.slots?.default?.()}</RAbsolute>
          <RAbsolute right='0' center='vertical'> {context.slots?.right?.()}</RAbsolute>
        </div>
      </div>;
    };
  },
});
