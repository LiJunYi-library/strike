/* eslint-disable import/prefer-default-export */
import {DefineComponent} from 'vue';

export declare const Fly: DefineComponent<{
  aniClass: string | string[];
}>;

export declare function RenderFly(div: HTMLElement, VNode: DefineComponent, appContext: any): void;

export declare function useBezierTool(div: HTMLElement, appContext: any): void;
