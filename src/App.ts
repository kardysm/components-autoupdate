import {SemVer} from "./isSemVer";
import {SemVerRange} from "./isSemVerRange";

export type ComponentName = string & { readonly type: unique symbol }


export interface Component {
  name: ComponentName
  version: SemVer
}

export interface RequireComponent {
  name: ComponentName
  range: SemVerRange
}





// TODO: tests

