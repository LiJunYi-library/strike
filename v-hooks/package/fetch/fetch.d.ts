import { Ref, ComputedRef, UnwrapNestedRefs } from "vue";
type ANY = any;
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

interface FetchConfig extends RequestInit {
  url: string;
  headers: ANY;
}

interface FetchHOCConfig<D = ANY> extends RequestInit {
  url?: string;
  urlParams?: ANY;
  body?: ANY;
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
  initHeaders?: HeadersInit;
  formatterFile?: (res: Response, config: this) => Promise<Blob>;
  formatterFileName?: (res: Response, config: this) => string;
  formatterResponse?: (res: Response, config: this) => ANY;
  formatterData?: (mRes: ANY, d: ANY, res: Response) => ANY;
  interceptRequest?: (fetchConfig: FetchConfig, config: this) => ANY;
  interceptResponseSuccess?: (res: Response, data: D, config: this) => Promise<ANY>;
  interceptResponseError?: (errorRes: ANY, config: this) => ANY;
}

type FetchApi<C = ANY, D = ANY, E = ANY> = {
  loading: boolean;
  data: D;
  begin: boolean;
  error: boolean;
  errorData: E;
  errEvents: ArrayEvents<ANY>;
  events: ArrayEvents<ANY>;
  send: (config?: C) => Promise<D>;
  nextSend: (config?: C) => Promise<D>;
  awaitSend: (config?: C) => Promise<D>;
  beginSend: (config?: C) => Promise<D>;
  nextBeginSend: (config?: C) => Promise<D>;
  awaitBeginSend: (config?: C) => Promise<D>;
  abort: () => void;
  abortAll: () => void;
};

interface UseFetch<T> {
  (options: T): FetchApi<T>;
}

type AAAA = {
  post: () => any;
  get: () => any;
};

export declare function useFetchHOC<T extends FetchHOCConfig>(options: T): UseFetch<T>;
export declare function fetchQueue(options: FetchQueueConfig): FetchQueue;
export declare function createFetchApi(...options: ANY): AAAA;
