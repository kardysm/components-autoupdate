# NOTE: package is WIP, not production ready yet

# Component autoupdate

Module for importing proper (version of) components for server-driven-ui systems.

## Description

This project aims to extend Server-Driven UI (SDUI) with ability to load needed components at specific versions, externally.

Current state of SDUI allows commanding of layouts made of components that already are present within client. It brings restrictions in frequent components update. Given component might be missing or version could be incompatible. 

SDUI sends which component app should render. After applying `component-autoupdate`, contract might be expanded with required semver range (package rely heavily on semver package)

Package aims to waive this restriction by looking for needed version as follows:
1. within client's space
2. in remote repository
3. then, load needed version


## Getting Started

### Installing

No installable package yet. Clone the repo if you want to build on its basis

### Executing program

* import and init package

```
    // insert your local path here 
    import {init} from 'components-autoupdate' 
    
    const autoupdater = init(options)
```
* init returns following api: 
```
{
importComponent,
registerVersion,
isSemVer,
isSemVerRange,
constants
}
```
* use `importComponent` in most cases; return type is result of `import(url)`
```
importComponent({
  name: ComponentName // <- string
  range: SemVerRange // valid semver range, passing isSemVerRange
  })
``` 
* use `registerVersion` if component of given version has been loaded outside `importComponent`

## Limitations

* Only valid semver versions are supported atm 
* It is ES6 module, not adapted evironments to other than JS
* default fetcher loads data from npm and components from unpkg. You can, however, pass custom fetcher with init options 

## Authors

Contributors names and contact info:

* [Twitter: Michał Kardyś @kardysm](https://twitter.com/kardysm)

## Version History

* 0.3.0 - pre-alpha version

## License

This project is licensed under the MIT License - see the LICENSE.md file for details

