// M = | 0*0' + 2*1'   0*2' + 2*3'   0*4' + 2*5' |
//     | 1*0' + 3*1'   1*2' + 3*3'   1*4' + 3*5' |
// 0*0' + 2*1' | 1*0' + 3*1' |  0*2' + 2*3' | 1*2' + 3*3' | 0*4' + 2*5' | 1*4' + 3*5'
// [0] [2] [4]
// [1] [3] [5]
// | 0*0' + 2*1'   0*2' + 2*3'   0*4' + 2*5' |
// | 1*0' + 3*1'   1*2' + 3*3'   1*4' + 3*5' |
// 0*0' + 2*1' | 1*0' + 3*1' |  0*2' + 2*3' | 1*2' + 3*3' | 0*4' + 2*5' | 1*4' + 3*5'
//  0*0' + 2*1' |
//  1*0' + 3*1' |
//  0*2' + 2*3' |
//  1*2' + 3*3' |
//  0*4' + 2*5' |
//  1*4' + 3*5'

/* eslint-disable import/prefer-default-export */
/* eslint-disable no-plusplus  */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-properties */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-use-before-define */

export function bser(anchorpoints, pointsAmount) {
  function MultiPointBezier(coord, t) {
    const len = coord.length;
    let x = 0;
    let y = 0;
    function erxiangshi(start, end) {
      let cs = 1;
      let bcs = 1;
      while (end > 0) {
        cs *= start;
        bcs *= end;
        start--;
        end--;
      }
      return cs / bcs;
    }
    for (let i = 0; i < len; i++) {
      const point = coord[i];
      x +=
        /* Math.round() */ point.x *
        Math.pow(1 - t, len - 1 - i) *
        Math.pow(t, i) *
        erxiangshi(len - 1, i);
      y +=
        /* Math.round() */ point.y *
        Math.pow(1 - t, len - 1 - i) *
        Math.pow(t, i) *
        erxiangshi(len - 1, i);
    }
    return {x, y};
  }
  const points = [];
  for (let i = 0; i < pointsAmount; i++) {
    const point = MultiPointBezier(anchorpoints, i / pointsAmount);
    points.push(point);
  }
  return points;
}

export function createAnimate(props = {}) {
  const config = {
    anchorpoints: [],
    time: 20,
    duration: 1000,
    onAnimationend: () => undefined,
    ...props,
  };
  let d;
  clearTimeout(d);
  const frame = config.duration / config.time;

  const args = {
    play,
    frames: bser(config.anchorpoints, frame),
    setFrames,
  };

  function setFrames(fs) {
    args.frames = bser(fs, frame);
  }

  function play(fun, index = 0) {
    if (index >= args.frames.length) {
      config.onAnimationend();
      return;
    }
    const item = args.frames[index];
    const nth = index + 1;
    fun(item, index, nth);
    d = setTimeout(() => {
      play(fun, nth);
    }, 20);
  }

  return args;
}
