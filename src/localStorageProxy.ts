import { SemVer } from "./isSemVer"
import { PARSE_ERROR } from "./constants"

export const localStorageProxy = () => {
  function deserialize(data: string | null): SemVer[] {
    if (data === null) {
      return []
    }
    try {
      return JSON.parse(data)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Versions|storage: ${PARSE_ERROR}: ${data}`)
      return []
    }
  }

  function serialize<T>(data: T[]): string {
    return JSON.stringify(data)
  }

  function getItem(key: string) {
    const serialized = localStorage.getItem(key)
    return deserialize(serialized)
  }

  function setItem(key: string, data: SemVer[]) {
    const serialized = serialize(data)
    localStorage.setItem(key, serialized)
  }

  return {
    getItem,
    setItem,
  }
}
