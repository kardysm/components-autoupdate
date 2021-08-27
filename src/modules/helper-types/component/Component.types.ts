import {SemVer, SemVerRange} from "../../semver"

export type ComponentName = string

export interface Component {
  name: ComponentName
  version: SemVer
}

export interface RequireComponent {
  name: ComponentName
  range: SemVerRange
}
