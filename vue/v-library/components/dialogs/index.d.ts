import { DefineComponent, VNode } from "vue";
import { DialogProps } from "element-plus";

export declare const Dialog: DefineComponent<any>;

export declare const FormDialog: DefineComponent<any>;

export declare function DialogHoc(options: any): DefineComponent<any>;

export declare function FormDialogHoc(options: any): DefineComponent<any>;

export declare function renderDialog(
  node:
    | VNode
    | ((resolve: (value: any) => void, reject: (reason?: any) => void) => VNode)
): Promise<void> | void;
