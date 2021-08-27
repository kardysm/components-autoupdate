import semver from 'semver';


export type SemVer = string & { readonly type: unique symbol }
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

export function isSemVer(str: string): str is SemVer {
  return semver.valid(str) !== null
}



// TODO: tests

