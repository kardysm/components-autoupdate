// eslint-disable-next-line import/no-extraneous-dependencies
import "ts-generic-fetch"
import {
  componentImporter,
  fetcher,
  FetcherApi,
  isSemVer, isSemVerRange,
  SemVer,
  SemVerRange,
  Store,
  versions,
  versionStorage,
  constants
} from "./modules"

interface InitOptions {
  fetcher?: FetcherApi
  storage?: Store
  prefix?: string
}

export type { Store, FetcherApi, SemVer, SemVerRange }

// TODO: tests

export function init(options: InitOptions) {
  const { storage, prefix, fetcher: externalFetcher } = options

  const fetcherApi = externalFetcher ?? fetcher
  const storeApi = versionStorage(storage, prefix)

  const versionsApi = versions(storeApi, fetcherApi)

  return {
    importComponent: componentImporter(versionsApi, fetcherApi),
    registerVersion: versionsApi.register,
    isSemVer,
    isSemVerRange,
    constants
  }
}
