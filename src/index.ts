// eslint-disable-next-line import/no-extraneous-dependencies
import "ts-generic-fetch"
import { loadComponent } from "./loadComponent"
import { versions } from "./versions"
import { fetcher, FetcherAPI } from "./fetcher"
import { Store, versionStorage } from "./versionStorage"
import {isSemVer, SemVer} from "./isSemVer";
import {isSemVerRange, SemVerRange} from "./isSemVerRange";

interface InitOptions {
  storage?: Store
  prefix?: string
  fetcher: FetcherAPI
}

export type { Store, FetcherAPI, SemVer, SemVerRange }

export function init(options: InitOptions) {
  const { storage, prefix, fetcher: externalFetcher } = options

  const fetcherApi = externalFetcher ?? fetcher
  const storeApi = versionStorage(storage, prefix)

  const versionsApi = versions(storeApi, fetcherApi)

  return {
    importComponent: loadComponent(versionsApi, fetcherApi),
    registerVersion: versionsApi.register,
    isSemVer,
    isSemVerRange
  }
}
