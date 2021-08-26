import semver from 'semver';
import {resolve as resolvePath} from "path";
// eslint-disable-next-line import/no-extraneous-dependencies
import 'ts-generic-fetch'

type SemVer = string & { readonly type: unique symbol }
type SemVerRange = SemVer
type ComponentName = string & { readonly type: unique symbol }

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

function isSemVer(str: string): str is SemVer {
  return semver.valid(str) !== null
}

type ComponentPackage = unknown;
const NO_COMPATIBLE_FOUND = 'NO_COMPATIBLE_FOUND';
const DEFAULT_STORAGE_PREFIX = '@component-versions'
const PARSE_ERROR = 'failed to parse local storage data';
const FETCH_ERROR = 'an error occured during components repository request';

// TODO: tests
// TODO: registry interceptor

type StorageAPI = ReturnType<typeof versionStorage>;

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

type Store = ReturnType<typeof localStorageProxy>;
const versionStorage = (store?: Store, prefix?: string) => {
  const {getItem, setItem} = store ?? localStorageProxy();

  function key(name: ComponentName) {
    const pref = prefix ?? DEFAULT_STORAGE_PREFIX;
    return `${pref}:${name}`;
  }


  function get(name: ComponentName): SemVer[] {
    return getItem(key(name))
  }

  function set(name: ComponentName, versions: SemVer[]): void {
    setItem(key(name), versions);
  }

  function add(name: ComponentName, version: SemVer): void {
    const currentVersions = get(name);

    set(name, [...currentVersions, version])
  }

  return ({
    get,
    set,
    add
  })
}

interface FetchVersions {
  fetchVersions(componentName: ComponentName): Promise<VersionsRegistryExpectedResult>,
}

interface FetchComponent {
  fetchComponent<T>(component: Component): Promise<T>
}

interface FetcherAPI extends FetchComponent, FetchVersions {
}

interface Fetcher {
  requestOptions: RequestInit
}

const fetcher = (registryUrl: string, options?: Fetcher) => {
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

const versionsApi = ((versionStorageApi: StorageAPI, fetcherApi: FetchVersions) => {
  const {get, add} = versionStorageApi;
  const {fetchVersions} = fetcherApi;

  return ({
    load: (() => ({
      local(name: ComponentName): SemVer[] {
        return get(name)
      },

      async remote(name: ComponentName): Promise<{ versions: SemVer[], latest: SemVer }> {
        const moduleMetadata = await fetchVersions(name);

        return {
          versions: Object.keys(moduleMetadata.versions).filter(isSemVer),
          latest: moduleMetadata?.["dist-tags"]?.latest
        }
      },
    }))(),

    match({name, range}: RequireComponent) {
      const {load, maxSatisfying} = this;
      return ({
        local() {
          const versions = load.local(name);
          return maxSatisfying(versions, range)
        },

        async remote() {
          const remote = await load.remote(name);
          const latest = this.single(remote.latest)
          if (latest) {
            return latest;
          }

          return maxSatisfying(remote.versions, range)

        },

        single(ver: SemVer) {
          return maxSatisfying([ver], range);
        }
      })
    },

    register(name: ComponentName, version: SemVer) {
      add(name, version)
    },

    maxSatisfying(versions: SemVer[], range: SemVerRange) {
      return semver.maxSatisfying(versions, range)
    },

    async findCompatible(component: RequireComponent) {
      const match = this.match(component);

      return match.local() ?? await match.remote() ?? NO_COMPATIBLE_FOUND;
    },
  })
})

const loadComponent = (versionApi: ReturnType<typeof versionsApi>, fetchApi: FetchComponent) => {
  const {findCompatible} = versionApi;
  const {fetchComponent} = fetchApi
  return async (requireComponent: RequireComponent) => {
    const compatible = await findCompatible(requireComponent)

    if (compatible === NO_COMPATIBLE_FOUND) {
      return null;
    }

    const component = {name: requireComponent.name, version: compatible};

    return fetchComponent(component);
  }
}

interface InitOptions {
  storage?: Store,
  prefix?: string,
  fetcher: FetcherAPI
}

function init(options: InitOptions) {
  const {storage, prefix, fetcher: externalFetcher} = options

  const fetcherApi = externalFetcher ?? fetcher
  const storeApi = versionStorage(storage, prefix)
  const versionApi = versionsApi(storeApi, fetcherApi);

  return loadComponent(versionApi);
}

const App = init
export default App;
