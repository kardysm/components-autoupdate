import {FetchComponent, RequireComponent, versionsApi} from "./App";
import {NO_COMPATIBLE_FOUND} from "./constants";

export const loadComponent = (versionApi: ReturnType<typeof versionsApi>, fetchApi: FetchComponent) => {
  const {findCompatible} = versionApi;
  const {fetchComponent} = fetchApi
  return async (requireComponent: RequireComponent) => {
    const compatible = await findCompatible(requireComponent)

    if (compatible === NO_COMPATIBLE_FOUND) {
      return null;
    }

    const component = {name: requireComponent.name, version: compatible};

    return fetchComponent(component);
  }
}
