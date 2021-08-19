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

function loadFromMemory(component: Component): ComponentPackage {
  return '';
}

function loadExternal(component: Component): ComponentPackage {
  return ''
}

function loadComponent(component: Component){
  const compatibleVersion = findCompatible(component)

  if (compatibleVersion){
    return loadFromMemory({ ...component, version: compatibleVersion})
  }

  return loadExternal(component)
}

const App = () => {
  return '';
}
export default App;
