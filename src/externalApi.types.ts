import {SemVer} from "./isSemVer";

type VersionData = unknown

export interface VersionsRegistryExpectedResult {
  "dist-tags": {
    latest: SemVer
  },
  versions: {
    [version: string]: VersionData
  }
}
