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

const versions = {
  loaded(name: ComponentName): SemVer[] {

    //indexedDB -> component:version
    return [];
  },

  getLocal(){

  },

  getRemote(){

  },

  register(name: ComponentName, version: SemVer){
    //register component's version
  },

  maxSatysfying(versions: SemVer[], range: SemVer) {
    return semver.maxSatysfying(versions, range)
  },

  findCompatible(component: RequireComponent) {
    const versions = this.loaded(component.name);
    return this.maxSatysfying(versions, component.range);
  },
}
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

function loadComponent(requireComponent: RequireComponent){
  const version = versions.findCompatible(requireComponent)
  const component = {name: requireComponent.name, version: version};

  return load.run(component);
}

const App = () => {
  return '';
}
export default App;
