import { Ref, ComputedRef, UnwrapNestedRefs } from "vue";
type ANY = unknown | object | any;
type FunReturnVal = () => ANY;

type FetchQueue = {
  queue: Promise[];
  push: (p: Promise, ...arg: ANY) => void;
  remove: (p: Promise) => void;
  del: (p: Promise) => void;
};

type FetchQueueConfig = {
  onBegin: () => ANY;
  onFinish: () => ANY;
  onRequest: () => ANY;
  onResponse: () => ANY;
};

type FetchHOCConfig = {
  url?: string;
  urlParams?: FunReturnVal | Ref | ComputedRef | UnwrapNestedRefs | object;
  body?: FunReturnVal | Ref | ComputedRef | UnwrapNestedRefs | object;
  baseUrl?: string = "";
  time?: number = 30000;
  isDownloadFile?: boolean = false;
  fileName?: string;
  loading?: boolean = false;
  begin?: boolean = false;
  error?: boolean = false;
  data?: ANY;
  errorData?: ANY;
  fetchQueue?: FetchQueue;
  formatterFile?: (res: Response, config: ANY) => ANY;
  formatterFileName?: (res: Response, config: ANY) => ANY;
  formatterResponse?: (res: Response, config: ANY) => ANY;
  formatterData?: (mRes: ANY, d: ANY, res: Response) => ANY;
  interceptRequest?: (fetchConfig: RequestInit, config: ANY) => ANY;
  interceptResponseSuccess?: (res: Response, data: ANY, config: ANY) => ANY;
  interceptResponseError?: (errorRes: ANY, config: ANY) => ANY;
};

type FetchApi = {
  loading: boolean;
  data: boolean;
  begin: boolean;
  error: boolean;
  errorData: boolean;
  errEvents: boolean;
  events: boolean;
  send: boolean;
  nextSend: boolean;
  awaitSend: boolean;
  beginSend: boolean;
  nextBeginSend: boolean;
  awaitBeginSend: boolean;
  abort: boolean;
  abortAll: boolean;
};

type AAAA = {
  post: () => any;
  get: () => any;
};

export declare function useFetchHOC(options: FetchHOCConfig): FetchApi;
export declare function fetchQueue(options: FetchQueueConfig): FetchQueue;
export declare function createFetchApi(...options: ANY): AAAA;
