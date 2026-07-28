import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'

import type { ViewAttributes } from '../AttributesPage.deps'
import type { AttributeListItem } from '../AttributesPage.types'

const mapType = (type: components['schemas']['AttributeType']): AttributeListItem['type'] => {
  switch (type) {
    case 0:
      return 'text'
    case 1:
      return 'list'
    default:
      throw new RangeError(`Unsupported attribute type: ${type}`)
  }
}

export const createViewAttributes =
  (client: ApiClient): ViewAttributes =>
  ({ signal }) =>
    executeQuery({
      map: (attributes) =>
        attributes?.map((attribute) => {
          if (attribute.id === undefined) {
            throw new TypeError('Attribute id is required')
          }
          return {
            color: attribute.color,
            id: String(attribute.id),
            name: attribute.name,
            type: mapType(attribute.type),
          }
        }),
      request: () => client.GET('/api/organizations/attributes', { signal }),
    })
