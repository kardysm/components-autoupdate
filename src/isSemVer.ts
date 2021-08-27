import semver from "semver"

export type SemVer = string & { readonly type: unique symbol }

export function isSemVer(str: string): str is SemVer {
  return semver.valid(str) !== null
}
