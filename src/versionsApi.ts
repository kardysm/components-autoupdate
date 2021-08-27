import semver from "semver";
import {NO_COMPATIBLE_FOUND} from "./constants";
import {ComponentName, isSemVer, RequireComponent, SemVer, SemVerRange, versionStorage} from "./App";
import {FetchVersions} from "./fetcher";

type StorageAPI = ReturnType<typeof versionStorage>;

export const versionsApi = ((versionStorageApi: StorageAPI, fetcherApi: FetchVersions) => {
  const {get, add} = versionStorageApi;
  const {fetchVersions} = fetcherApi;

  return ({
    load: (() => ({
      local(name: ComponentName): SemVer[] {
        return get(name)
      },

      async remote(name: ComponentName): Promise<{ versions: SemVer[], latest: SemVer }> {
        const moduleMetadata = await fetchVersions(name);

        return {
          versions: Object.keys(moduleMetadata.versions).filter(isSemVer),
          latest: moduleMetadata?.["dist-tags"]?.latest
        }
      },
    }))(),

    match({name, range}: RequireComponent) {
      const {load, maxSatisfying} = this;
      return ({
        local() {
          const versions = load.local(name);
          return maxSatisfying(versions, range)
        },

        async remote() {
          const remote = await load.remote(name);
          const latest = this.single(remote.latest)
          if (latest) {
            return latest;
          }

          return maxSatisfying(remote.versions, range)

        },

        single(ver: SemVer) {
          return maxSatisfying([ver], range);
        }
      })
    },

    register(name: ComponentName, version: SemVer) {
      add(name, version)
    },

    maxSatisfying(versions: SemVer[], range: SemVerRange) {
      return semver.maxSatisfying(versions, range)
    },

    async findCompatible(component: RequireComponent) {
      const match = this.match(component);

      return match.local() ?? await match.remote() ?? NO_COMPATIBLE_FOUND;
    },
  })
})
