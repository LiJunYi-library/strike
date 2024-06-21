export declare function useSetInterval(
  callback: () => void,
  ms?: number | undefined
): NodeJS.Timer;

export declare function useSetTimeout(
  callback: () => void,
  ms?: number | undefined
): NodeJS.Timer;

type TimerLockProp = {
  automation?: boolean;
  interval?: number;
  time?: number;
  numRef?: ref;
  pauseRef?: ref;
  onFinish: (...arg: any) => any;
};

export declare function useTimerLock(props: TimerLockProp): {
  num: number;
  lock: boolean;
  isPause: boolean;
  afresh: (t: number) => void;
  pause: () => void;
  Continue: () => void;
};
