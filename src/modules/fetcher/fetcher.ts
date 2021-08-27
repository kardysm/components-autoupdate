import { resolve as resolvePath } from "path"
import { FETCH_ERROR } from "../constants"
import { Component, ComponentName } from "../helper-types/component"
import { VersionsRegistryExpectedResult } from "../helper-types/externalPayload"

export interface FetchVersions {
  fetchVersions(
    componentName: ComponentName
  ): Promise<VersionsRegistryExpectedResult>
}

export interface FetchComponent {
  fetchComponent<T>(component: Component): Promise<T>
}

export interface FetcherApi extends FetchComponent, FetchVersions {}

export const DEFAULT_VERSIONS_REGISTRY = '://registry.npmjs.org/'
export const DEFAULT_COMPONENTS_REGISTRY = '://unpkg.com/'

export const fetcher: FetcherApi = (() => {
  const fn = fetch

  async function requestData<Data>(url: string): Promise<Data> {
    const result = await fn<Data>(url)
    try {
      return await result.json()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Component|repository: ${FETCH_ERROR}: ${error}`)
      return error
    }
  }

  function versionsUrl(componentName: ComponentName) {
    return resolvePath(DEFAULT_VERSIONS_REGISTRY, componentName)
  }

  function componentUrl(component: Component) {
    const { version, name } = component
    return resolvePath(DEFAULT_COMPONENTS_REGISTRY, `${name}@${version}`)
  }

  function fetchVersions(componentName: ComponentName) {
    const url = versionsUrl(componentName)

    return requestData<VersionsRegistryExpectedResult>(url)
  }

  function fetchComponent(component: Component) {
    const url = componentUrl(component)

    return import(url)
  }

  return {
    fetchVersions,
    fetchComponent,
  }
})()
