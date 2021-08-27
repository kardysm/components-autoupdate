import semver from 'semver';
import {resolve as resolvePath} from "path";
// eslint-disable-next-line import/no-extraneous-dependencies
import 'ts-generic-fetch'
import {DEFAULT_STORAGE_PREFIX, FETCH_ERROR, PARSE_ERROR} from "./constants";

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

export interface FetchVersions {
  fetchVersions(componentName: ComponentName): Promise<VersionsRegistryExpectedResult>,
}

export interface FetchComponent {
  fetchComponent<T>(component: Component): Promise<T>
}

export interface FetcherAPI extends FetchComponent, FetchVersions {
}

interface Fetcher {
  requestOptions: RequestInit
}

export const fetcher = (registryUrl: string, options?: Fetcher) => {
  const {requestOptions} = options ?? {};
  const fn = fetch;

  async function requestData<Data>(url: string): Promise<Data> {

    const result = await fn<Data>(url, requestOptions);
    try {
      return await result.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`Component|repository: ${FETCH_ERROR}: ${error}`)
      return error;
    }
  }

  function versionsUrl(componentName: ComponentName) {
    return resolvePath(registryUrl, componentName);
  }

  function componentUrl(component: Component) {
    const {version, name} = component;
    return resolvePath(registryUrl, `${name}@${version}`);
  }

  function fetchVersions(componentName: ComponentName) {
    const url = versionsUrl(componentName);

    return requestData<VersionsRegistryExpectedResult>(url)
  }

  function fetchComponent(component: Component) {
    const url = componentUrl(component);

    return import(url);
  }

  return {
    fetchVersions,
    fetchComponent
  }
}


