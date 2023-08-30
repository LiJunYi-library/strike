import { DefineComponent } from "vue";
import { TableProps } from "element-plus";

export declare function TableHoc(config?: any): Table;

export declare function TableColumnHoc(config?: any): TableColumn;

export declare const Table: DefineComponent<TableProps>;
export declare const PaginationTable: DefineComponent<TableProps>;

export declare const TableColumn: DefineComponent<any>;
export declare const TableColumnOptions: DefineComponent<any>;
export declare const TableColumnButton: DefineComponent<any>;
export declare const TableColumnText: DefineComponent<any>;
export declare const TableColumnLink: DefineComponent<any>;
export declare const TableColumnImg: DefineComponent<any>;