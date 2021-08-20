import React from 'react';
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

const versions = () => ({
  load: function (){
    return ({
      local(name: ComponentName): SemVer[] {

        //indexedDB -> component:version
        return [];
      },

      remote(name: ComponentName): {versions: SemVer[], latest: SemVer} {
        //registry name
        //fetch component data
        return {
          versions: [],
          latest: '' as SemVer
        }
      },
    })
  }(),

  match: function (range: SemVerRange){
    const {load, maxSatisfying} = this;
  return ({
    local(name: ComponentName) {
      const versions = load.local(name);
      maxSatisfying(versions, range)

    },

    remote(name: ComponentName) {
      const remote = load.remote(name);
      const latest = this.latest(remote.latest)
      if (latest){
        return latest;
      }

      return maxSatisfying(remote.versions, range)

    },

    latest(version: SemVer) {
      return maxSatisfying([version], range);
    }
  })
},

  register(name: ComponentName, version: SemVer) {
    //register component's version
  },

  maxSatisfying(versions: SemVer[], range: SemVerRange) {
    return semver.maxSatisfying(versions, range)
  },

  findCompatible(component: RequireComponent) {
    const versions = this.local(component.name);

    //matchLocal
    //matchLatest
    //matchRemote
    return this.maxSatisfying(versions, component.range);
  },
})

const load = {
  run(component: Component): ComponentPackage {
    return '';
  }
  // fromMemory(component: Component): ComponentPackage {
  //   return '';
  // },
  //
  // external(component: Component): ComponentPackage {
  //   return ''
  // }
}

function loadComponent(requireComponent: RequireComponent) {
  const version = versions.findCompatible(requireComponent)
  const component = {name: requireComponent.name, version: version};

  return load.run(component);
}

const App = () => {
  return '';
}
export default App;
