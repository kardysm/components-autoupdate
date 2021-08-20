import './App.css';
import semver from 'semver';

type SemVer = string & { readonly type: unique symbol }
type SemVerRange = SemVer;
type ComponentName = string & { readonly type: unique symbol }

type Component = {
  name: ComponentName
  version: SemVer
}
type RequireComponent = {
  name: ComponentName
  range: SemVerRange
}

type ComponentPackage = unknown;

const NO_COMPATIBLE_FOUND = 'NO_COMPATIBLE_FOUND';

//TODO: tests
//TODO: DB driver
//TODO: registry interceptor

const versions = (() => ({
    load: function () {
      return ({
        local(name: ComponentName): SemVer[] {

          //TODO: indexedDB -> component:version
          return [];
        },

        remote(name: ComponentName): { versions: SemVer[], latest: SemVer } {
          //TODO: registry name
          //TODO: fetch component data
          return {
            versions: [],
            latest: '' as SemVer
          }
        },
      })
    }(),

    match: function ({name, range}: RequireComponent) {
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

        single(version: SemVer) {
          return maxSatisfying([version], range);
        }
      })
    },

    register(name: ComponentName, version: SemVer) {
      //TODO: register component's version
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
const load = (component: Component): ComponentPackage => {
  //TODO default loader
    return '';
  }

function loadComponent(requireComponent: RequireComponent) {
  const version = versions.findCompatible(requireComponent)

  if(version === NO_COMPATIBLE_FOUND){
    return null;
  }

  const component = {name: requireComponent.name, version: version};

  return load(component);
}

const App = () => {
  return '';
}
export default App;
