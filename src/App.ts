import {SemVer} from "./isSemVer";

export type SemVerRange = SemVer
export type ComponentName = string & { readonly type: unique symbol }

type VersionData = unknown

export interface Component {
  name: ComponentName
  version: SemVer
}

export interface RequireComponent {
  name: ComponentName
  range: SemVerRange
}

export interface VersionsRegistryExpectedResult {
  "dist-tags": {
    latest: SemVer
  },
  versions: {
    [version: string]: VersionData
  }
}




// TODO: tests

