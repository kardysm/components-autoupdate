import semver from 'semver';

type SemVer = string & { readonly type: unique symbol }
type SemVerRange = SemVer;
type ComponentName = string & { readonly type: unique symbol }

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

// TODO: tests
// TODO: DB driver
// TODO: registry interceptor

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
