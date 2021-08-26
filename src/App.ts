import semver from 'semver';

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

// TODO: tests
// TODO: registry interceptor

const storage = (store: Store = localStorage, prefix: string) => {
  function key(name: ComponentName){
    return `${prefix}:${name}`;
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
    const serialized = store.getItem(key(name))

    return deserialize(serialized);
  }
    function set  (name: ComponentName, versions: SemVer[]): void {
    const serialized = serialize(versions)

    store.setItem(key(name),serialized);
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

const version = (() => ({
    load: (() => ({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      local(name: ComponentName): SemVer[] {

        // TODO: indexedDB -> component:version
        return [];
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

    match ({name, range}: RequireComponent) {
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

    register(/* name: ComponentName, version: SemVer */) {
      // TODO: register component's version
    },

    maxSatisfying(versions: SemVer[], range: SemVerRange) {
      return semver.maxSatisfying(versions, range)
    },

    findCompatible(component: RequireComponent) {
      const match = this.match(component);

      return match.local() ?? match.remote() ?? NO_COMPATIBLE_FOUND;
    },
  })
)()

// TODO default loader
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const load = (component: Component): ComponentPackage =>  ''

function loadComponent(requireComponent: RequireComponent) {
  const compatible = version.findCompatible(requireComponent)

  if(compatible === NO_COMPATIBLE_FOUND){
    return null;
  }

  const component = {name: requireComponent.name, version: compatible};

  return load(component);
}

const App = () => loadComponent
export default App;
