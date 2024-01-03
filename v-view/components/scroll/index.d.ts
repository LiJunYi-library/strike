import { DefineComponent } from "vue";

export declare const RScroll: DefineComponent<any>;

export declare const RScrollSticky: DefineComponent<any>;

export declare const RScrollFlotage: DefineComponent<any>;

export declare const RScrollFold: DefineComponent<any>;

export declare const RScrollFixed: DefineComponent<any>;

export declare const RScrollList: DefineComponent<any>;

export declare const RScrollVirtualList: DefineComponent<any>;

export declare const RVirtualScrollList: DefineComponent<any>;

export class ScrollController {
  onScroll: void;
  onFlotage: void;
  events: any[];
  scrollAllTop: (top: number) => void;
}

export * from "./scroll-page";
