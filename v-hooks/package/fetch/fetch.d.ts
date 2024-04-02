type ANY = any;
type FunReturnVal = () => ANY;

type FetchQueue = {
  queue: Promise[];
  push: (p: Promise, ...arg: ANY) => void;
  remove: (p: Promise) => void;
  del: (p: Promise) => void;
};

type FetchQueueConfig<C = ANY, H = ANY> = {
  onBegin: (config?: C, hooks?: H) => ANY;
  onFinish: (config?: C, hooks?: H) => ANY;
  onRequest: (config?: C, hooks?: H) => ANY;
  onResponse: (config?: C, hooks?: H) => ANY;
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

type FetchHooks<C = ANY, D = ANY, E = ANY> = {
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

interface UseFetch<C> {
  (options: C): FetchHooks<C>;
}

type FetchApi<C> = {
  post:{
    (url: string) : FetchHooks<C>;
    (url: string, body: object) : FetchHooks<C>;
    (url: string, body: () => object) : FetchHooks<C>;
  },
  get:{
     (url: string) : FetchHooks<C>;
     (url: string, urlParams: object) : FetchHooks<C>;
     (url: string, urlParams: () => object): FetchHooks<C>;
  }
};

export declare function useFetchHOC<C extends FetchHOCConfig>(options: C): UseFetch<C>;

export declare function fetchQueue<C extends FetchHOCConfig>(
  options: FetchQueueConfig<C, FetchHooks<C>>
): FetchQueue;

export declare function createFetchApi<C extends FetchHOCConfig>(
  useFetch: UseFetch<C>
): FetchApi<C>;
