// eslint-disable-next-line import/no-extraneous-dependencies
import "ts-generic-fetch"
import { componentImporter } from "./modules/componentImporter"
import { versions } from "./modules/versions"
import { fetcher, FetcherAPI } from "./modules/fetcher"
import { Store, versionStorage } from "./modules/versions/versionStorage"
import {isSemVer, isSemVerRange, SemVer, SemVerRange} from "./modules/semver";
import * as constants from './constants'

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
    importComponent: componentImporter(versionsApi, fetcherApi),
    registerVersion: versionsApi.register,
    isSemVer,
    isSemVerRange,
    constants
  }
}
