import React from 'react';
import './App.css';

type SemVer = string & { readonly type: unique symbol }
type ComponentName = string & { readonly type: unique symbol }

type Component = {
  name: ComponentName
  version: SemVer
}

function localVersions(name: ComponentName) {

}

function loadComponent(component: Component){

}

const App = () => {
  return '';
}
export default App;
