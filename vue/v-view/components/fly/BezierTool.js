/* eslint-disable import/prefer-default-export */
/* eslint-disable no-plusplus  */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-properties */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
import {render} from 'vue';
import BezierTool from './BezierTool.vue';

// export BezierTool

export function useBezierTool(div = document.body, appContext) {
  const node = <BezierTool></BezierTool>;
  node.appContext = appContext;
  render(node, div);
}
