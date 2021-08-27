import {DEFAULT_STORAGE_PREFIX, PARSE_ERROR} from "./constants";
import {ComponentName, SemVer} from "./App";

export type Store = ReturnType<typeof localStorageProxy>;

const localStorageProxy = () => {
  function deserialize(data: string | null): SemVer[] {
    if (data === null) {
      return []
    }
    try {
      return JSON.parse(data)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Versions|storage: ${PARSE_ERROR}: ${data}`)
      return []
    }
  }

  function serialize<T>(data: T[]): string {
    return JSON.stringify(data)
  }

  function getItem(key: string) {
    const serialized = localStorage.getItem(key);
    return deserialize(serialized);
  }

  function setItem(key: string, data: SemVer[]) {
    const serialized = serialize(data);
    localStorage.setItem(key, serialized);
  }

  return {
    getItem,
    setItem
  }
}

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


