export interface UseEventListener {
  (
    element: HTMLElement | Document,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions | undefined
  ): void;
  doc(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions | undefined
  ): void;
  docClick(
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions | undefined
  ): void;
}

export declare const useEventListener: UseEventListener;


// interface UseIntersectionObserver{
//   (
//     element: HTMLElement | Document,
//     type: string,
//     listener: EventListenerOrEventListenerObject,
//     options?: boolean | AddEventListenerOptions | undefined
//   ): void;
//   ob(
//     element: HTMLElement,
//     intersectionCb: ,
//     options?: boolean | AddEventListenerOptions | undefined
//   ): void;
// }