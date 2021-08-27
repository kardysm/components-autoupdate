// eslint-disable-next-line import/no-extraneous-dependencies
import 'ts-generic-fetch';
import {loadComponent} from "./loadComponent";
import {versionsApi} from "./versionsApi";
import {fetcher, FetcherAPI} from "./fetcher";
import {Store, versionStorage} from "./versionStorage";

interface InitOptions {
  storage?: Store,
  prefix?: string,
  fetcher: FetcherAPI
}

export type {
  Store,
  FetcherAPI
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
