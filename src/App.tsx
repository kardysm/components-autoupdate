import React from 'react';
import './App.css';
import semver from 'semver';

type SemVer = string & { readonly type: unique symbol }
type SemVerRange = SemVer;
type ComponentName = string & { readonly type: unique symbol }

type Component = {
  name: ComponentName
  version: SemVer
  range: SemVerRange
}

type ComponentPackage = unknown;

function loadedVersions(name: ComponentName): SemVer[] {

  return [];
}

function maxSatysfying(versions: SemVer[], range: SemVer){
  return semver.maxSatysfying(versions, range)
}

function findCompatible(component: Component) {
  const versions = loadedVersions(component.name);
  return maxSatysfying(versions, component.range);
}

const load = {
  fromMemory(component: Component): ComponentPackage {
    return '';
  },

  external(component: Component): ComponentPackage {
    return ''
  }
}

function loadComponent(component: Component){
  const compatibleVersion = findCompatible(component)

  if (compatibleVersion){
    return load.fromMemory({ ...component, version: compatibleVersion})
  }

  return load.external(component)
}

const App = () => {
  return '';
}
export default App;
