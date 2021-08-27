import semver from "semver"

export type SemVerRange = string & { readonly type: unique symbol }

export function isSemVerRange(str: string): str is SemVerRange {
  return semver.validRange(str) !== null
}
