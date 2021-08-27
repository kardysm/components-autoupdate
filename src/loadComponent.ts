import {RequireComponent} from "./Component.types";
import {NO_COMPATIBLE_FOUND} from "./constants";
import {versions} from "./versions";
import {FetchComponent} from "./fetcher";

export const loadComponent = (versionApi: ReturnType<typeof versions>, fetchApi: FetchComponent) => {
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
