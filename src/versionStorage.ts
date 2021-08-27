import {DEFAULT_STORAGE_PREFIX} from "./constants";
import {ComponentName} from "./App";
import {SemVer} from "./isSemVer";
import {localStorageProxy} from "./localStorageProxy";

export type Store = ReturnType<typeof localStorageProxy>;


export const versionStorage = (store?: Store, prefix?: string) => {
  const {getItem, setItem} = store ?? localStorageProxy();

  function key(name: ComponentName) {
    const pref = prefix ?? DEFAULT_STORAGE_PREFIX;
    return `${pref}:${name}`;
  }

  function deduplicate(versions: SemVer[]) {
    return [...new Set(versions)]
  }

  function get(name: ComponentName): SemVer[] {
    return getItem(key(name))
  }

  function set(name: ComponentName, versions: SemVer[]): void {
    setItem(key(name), versions);
  }

  function add(name: ComponentName, version: SemVer): void {
    const currentVersions = get(name);

    set(name, deduplicate([...currentVersions, version]))
  }

  return ({
    get,
    set,
    add
  })
}


