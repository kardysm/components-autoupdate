import {fetcher, FetcherAPI, loadComponent, Store, versionsApi, versionStorage} from "./App";

interface InitOptions {
  storage?: Store,
  prefix?: string,
  fetcher: FetcherAPI
}

export function init(options: InitOptions) {
  const {storage, prefix, fetcher: externalFetcher} = options

  const fetcherApi = externalFetcher ?? fetcher
  const storeApi = versionStorage(storage, prefix)

  const versionApi = versionsApi(storeApi, fetcherApi);

  return {
    importComponent: loadComponent(versionApi, fetcherApi),
    registerVersion: versionApi.register
  };
}
