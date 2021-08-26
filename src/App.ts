import semver from 'semver';
import {resolve as resolvePath} from "path";
// eslint-disable-next-line import/no-extraneous-dependencies
import 'ts-generic-fetch'

type SemVer = string & { readonly type: unique symbol }
type SemVerRange = SemVer;
type ComponentName = string & { readonly type: unique symbol }

type Store = Pick<Storage,'getItem'|'setItem'>

export interface Component {
  name: ComponentName
  version: SemVer
}

export interface RequireComponent {
  name: ComponentName
  range: SemVerRange
}

type ComponentPackage = unknown;
const NO_COMPATIBLE_FOUND = 'NO_COMPATIBLE_FOUND';
const DEFAULT_STORAGE_PREFIX = '@component-versions'
const PARSE_ERROR = 'failed to parse local storage data';
const FETCH_ERROR = 'an error occured during components repository request';

// TODO: tests
// TODO: registry interceptor

type StorageAPI = ReturnType<typeof versionStorage>;

const versionStorage = (store?: Store, prefix?: string) => {
  const {getItem, setItem} = store ?? localStorage;

  function key(name: ComponentName){
    const pref = prefix ?? DEFAULT_STORAGE_PREFIX;
    return `${pref}:${name}`;
  }
  function deserialize(data: string | null): SemVer[] {
    if(data === null){
      return []
    }
    try {
      return JSON.parse(data)
    } catch (e){
      // eslint-disable-next-line no-console
      console.error(`Versions|storage: ${PARSE_ERROR}: ${data}`)
      return []
    }
  }
    function serialize<T>(data: T[]): string {
      return JSON.stringify(data)
    }

  function get (name: ComponentName): SemVer[] {
    const serialized = getItem(key(name))

    return deserialize(serialized);
  }
    function set  (name: ComponentName, versions: SemVer[]): void {
    const serialized = serialize(versions)

      setItem(key(name),serialized);
  }

  function add(name: ComponentName, version: SemVer): void {
    const currentVersions = get(name);

    set(name,  [...currentVersions,version])
  }

  return ({
    get,
    set,
    add

  })
}

const fetcher = (registryUrl: string, options?: {fetchMethod?: typeof fetch, requestOptions: RequestInit}) => {
  const {fetchMethod, requestOptions} = options ?? {};
  const fn = fetchMethod ?? fetch;

  async function requestData(url: string) {

    const result = await fn(url, requestOptions);
    try {
      return await result.json();
    } catch (error){
      console.log(`Component|repository: ${FETCH_ERROR}: ${error}`)
      return error;
    }
  }

  function versionsUrl(componentName: ComponentName) {
    return resolvePath(registryUrl,componentName);
  }
  function componentUrl(component: Component) {
    const compUrl = versionsUrl(component.name);
    return resolvePath(compUrl,component.version);
  }

  function fetchVersions(componentName: ComponentName) {
    const url = versionsUrl(componentName);

    return requestData(url)
  }
  function fetchComponent(component: Component) {
    const url = componentUrl(component);

    return requestData(url)
  }
  return {
    fetchVersions,
    fetchComponent
  }
}
const versionsApi = ((versionStorageApi: StorageAPI) => {
  const {get, set, add} = versionStorageApi;

  return ({
    load: (() => ({
      local(name: ComponentName): SemVer[] {
        return get(name)
      },

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      remote(name: ComponentName): { versions: SemVer[], latest: SemVer } {
        // TODO: registry name
        // TODO: fetch component data
        return {
          versions: [],
          latest: '' as SemVer
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

        remote() {
          const remote = load.remote(name);
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

    register( name: ComponentName, version: SemVer ) {
      add(name, version)
    },

    maxSatisfying(versions: SemVer[], range: SemVerRange) {
      return semver.maxSatisfying(versions, range)
    },

    findCompatible(component: RequireComponent) {
      const match = this.match(component);

      return match.local() ?? match.remote() ?? NO_COMPATIBLE_FOUND;
    },
  })
})

// TODO default loader
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const load = (component: Component): ComponentPackage =>  ''

const loadComponent = (versionApi: ReturnType<typeof versionsApi>) => {
  const {findCompatible} = versionApi;
  return (requireComponent: RequireComponent) => {
    const compatible = findCompatible(requireComponent)

    if (compatible === NO_COMPATIBLE_FOUND) {
      return null;
    }

    const component = {name: requireComponent.name, version: compatible};

    return load(component);
  }
}
function init(storage?: Store, prefix?: string){
  const storeApi = versionStorage(storage, prefix);
  const versionApi = versionsApi(storeApi);

  return loadComponent(versionApi);
}

const App = init
export default App;
