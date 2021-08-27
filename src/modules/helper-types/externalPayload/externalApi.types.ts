import { SemVer } from "../../semver"

type VersionData = unknown

export interface VersionsRegistryExpectedResult {
  "dist-tags": {
    latest: SemVer
  }
  versions: {
    [version: string]: VersionData
  }
}
