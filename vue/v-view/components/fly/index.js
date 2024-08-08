/* eslint-disable import/prefer-default-export */
/* eslint-disable no-plusplus  */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-properties */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-use-before-define */

import {defineComponent, ref, renderSlot, reactive, computed, onMounted, render} from 'vue';
import {createAnimate} from './c';

export const Fly = defineComponent({
  props: {
    unFlyClass: {type: [Array, String], default: () => ''},
    flyingClass: {type: [Array, String], default: () => ''},
    unFlyStyle: {type: [Object, String], default: () => ({})},
    flyingStyle: {type: [Object, String], default: () => ({})},
    flyingTransition: {type: String, default: '0.8s'},

    matrixs: {type: Array, default: () => []},
    matrixFuns: {type: String, default: ''},

    targetId: {type: String, default: ''},
    targetEl: {type: HTMLElement, default: () => undefined},
    targetRef: {type: [Object, String], default: () => undefined},
    isRemove: {type: Boolean, default: true},
    isClickFly: {type: Boolean, default: true},
    isFeedback: {type: Boolean, default: false},
    isMountedFly: {type: Boolean, default: false},

    duration: {type: Number, default: 800},
    pointBezier: {type: Array, default: () => undefined},
  },
  emits: ['flyEnd', 'flyStart', 'click'],
  setup(props, context) {
    const unFlyClass = ref(props.unFlyClass);
    const flyingClass = ref('');
    const flyingStyle = ref('');
    const flyingTransition = ref('');
    const unFlyStyle = ref(props.unFlyStyle);
    let node;
    let targetHtml;
    const style = reactive({});
    const animate = createAnimate({onAnimationend: onTransitionend, duration: props.duration});

    const targetNode = computed(() => {
      if (props.targetEl) return props.targetEl;
      if (props?.targetRef?.value?.$el) return props.targetRef.value.$el;
      if (props?.targetRef?.$el) return props?.targetRef?.$el;
      if (props.targetRef) return props.targetRef;
      return targetHtml;
    });

    function getOrigin(el) {
      if (!el) return {x: 0, y: 0};
      const offset = el.getBoundingClientRect();
      return {
        x: offset.left + offset.width / 2,
        y: offset.top + offset.height / 2,
      };
    }

    function getMatrixValues(el) {
      const computedStyle = window.getComputedStyle(el);
      const currentTransform = computedStyle.getPropertyValue('transform');
      function matrix(...args) {
        return args;
      }
      try {
        // eslint-disable-next-line no-eval
        const value = eval(currentTransform);
        return value;
      } catch (error) {
        return [1, 0, 0, 1, 0, 0];
      }
    }

    function multiplyMatrix(matrix1, matrix2) {
      return [
        matrix1[0] * matrix2[0] + matrix1[2] * matrix2[1],
        matrix1[1] * matrix2[0] + matrix1[3] * matrix2[1],
        matrix1[0] * matrix2[2] + matrix1[2] * matrix2[3],
        matrix1[1] * matrix2[2] + matrix1[3] * matrix2[3],
        matrix1[0] * matrix2[4] + matrix1[2] * matrix2[5] + matrix1[4],
        matrix1[1] * matrix2[4] + matrix1[3] * matrix2[5] + matrix1[5],
      ];
    }

    function multiplyMatrixs(...matrixs) {
      // console.log('matrixs', matrixs);
      if (matrixs.length <= 1) return matrixs[0];
      const newMatrixs = multiplyMatrix(matrixs[0], matrixs[1]);
      const args = [...matrixs];
      args.splice(0, 2, newMatrixs);
      return multiplyMatrixs(...args);
    }

    function matrixFly(origin, tOrigin, matrix) {
      // debugger; 在下一帧更改位置
      requestAnimationFrame(() => {
        const translateMatrix = [1, 0, 0, 1, tOrigin.x - origin.x, tOrigin.y - origin.y];
        const targetMatrix = multiplyMatrixs(translateMatrix, matrix, ...props.matrixs);
        style.transform = `matrix(${targetMatrix.join(',')}) ${props.matrixFuns}`;
      });
    }

    function animationFly(origin, tOrigin, matrix) {
      flyingTransition.value = '';
      const tP = {
        x: tOrigin.x - origin.x,
        y: tOrigin.y - origin.y,
      };
      animate.setFrames([{x: 0, y: 0}, ...props.pointBezier, tP]);
      animate.play(position => {
        style.transform = `translate(${position.x}px,${position.y}px)`;
      });
    }

    async function flying() {
      flyingClass.value = '';
      flyingStyle.value = '';
      flyingTransition.value = '';
      // style.animationPlayState = 'paused';
      const origin = getOrigin(node);
      const tOrigin = getOrigin(targetNode.value);
      const matrix = getMatrixValues(node);
      style.transform = `matrix(${matrix.join(',')})`;
      context.emit('flyStart');
      unFlyClass.value = '';
      unFlyStyle.value = '';
      flyingClass.value = props.flyingClass;
      flyingStyle.value = props.flyingStyle;
      flyingTransition.value = props.flyingTransition;
      // style.animationPlayState = 'running';
      // console.log(origin);
      // console.log(tOrigin);
      // console.log(matrix);
      if (props.pointBezier) animationFly(origin, tOrigin, matrix);
      else matrixFly(origin, tOrigin, matrix);
    }

    function onTransitionend() {
      // console.log('onTransitionend');
      if (props.isRemove) node.remove();
      flyingClass.value = '';
      flyingStyle.value = '';
      flyingTransition.value = '';
      unFlyClass.value = props.unFlyClass;
      unFlyStyle.value = props.unFlyStyle;
      context.emit('flyEnd');
      if (props.isFeedback) {
        props.targetRef?.feedback?.();
        props.targetRef?.value?.feedback?.();
      }
    }

    function onRef(el) {
      node = el;
    }

    function onClick(e) {
      if (props.isClickFly) flying();
      e.flying = flying;
      context.emit('click', e);
    }

    onMounted(() => {
      if (props.targetId) targetHtml = document.getElementById(props.targetId);
      if (props.isMountedFly) flying();
    });

    context.expose({flying});
    return () => {
      return (
        <div
          style={[style, {transition: flyingTransition.value}, flyingStyle.value, unFlyStyle.value]}
          class={['r-fly', flyingClass.value, unFlyClass.value]}
          onClick={onClick}
          ref={onRef}
          onAnimationend={onTransitionend}
          onTransitionend={onTransitionend}>
          {renderSlot(context.slots, 'default')}
        </div>
      );
    };
  },
});

export function RenderFly(div, VNode, isCache = false, appContext) {
  let node = VNode;
  if (VNode instanceof Function) node = VNode();
  if (!VNode.appContext) VNode.appContext = appContext;
  render(node, div);
  if (!isCache) {
    div.erudaEvents = undefined;
    div._vnode = undefined;
  }
}

export * from './BezierTool';
