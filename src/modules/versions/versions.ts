import semver from "semver"
import { NO_COMPATIBLE_FOUND } from "../constants"
import { ComponentName, RequireComponent } from "../helper-types/component"
import { FetchVersions } from "../fetcher"
import { versionStorage } from "./versionStorage"
import {isSemVer, SemVer, SemVerRange} from "../semver"

type StorageAPI = ReturnType<typeof versionStorage>

export const versions = (
  versionStorageApi: StorageAPI,
  fetcherApi: FetchVersions
) => {
  const { get, add } = versionStorageApi
  const { fetchVersions } = fetcherApi
  const load = (function loadVersions() {
    return {
      local(name: ComponentName): SemVer[] {
        return get(name)
      },

      async remote(
        name: ComponentName
      ): Promise<{ versions: SemVer[]; latest: SemVer }> {
        const moduleMetadata = await fetchVersions(name)

        return {
          versions: Object.keys(moduleMetadata.versions).filter(isSemVer),
          latest: moduleMetadata?.["dist-tags"]?.latest,
        }
      },
    }
  })()

  function maxSatisfying(verArr: SemVer[], range: SemVerRange) {
    return semver.maxSatisfying(verArr, range)
  }

  function match({ name, range }: RequireComponent) {
    function single(ver: SemVer) {
      return maxSatisfying([ver], range)
    }

    return {
      local() {
        const localVersions = load.local(name)
        return maxSatisfying(localVersions, range)
      },

      async remote() {
        const remote = await load.remote(name)
        const latest = single(remote.latest)
        if (latest) {
          return latest
        }

        return maxSatisfying(remote.versions, range)
      },
    }
  }

  return {
    register(name: ComponentName, version: SemVer) {
      add(name, version)
    },

    async findCompatible(component: RequireComponent) {
      const matchVersion = match(component)

      return (
        matchVersion.local() ??
        (await matchVersion.remote()) ??
        NO_COMPATIBLE_FOUND
      )
    },
  }
}
