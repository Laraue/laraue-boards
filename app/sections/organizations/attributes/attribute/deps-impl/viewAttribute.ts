import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'

import type { ViewAttribute } from '../AttributePage.deps'
import type { Attribute } from '../AttributePage.types'

const mapAttribute = (value: components['schemas']['AttributeDto']): Attribute => {
  if (value.id === undefined) {
    throw new TypeError('Attribute id is required')
  }
  if (value.type === 'Text') {
    return {
      color: value.color,
      data: { type: 'text' },
      id: String(value.id),
      name: value.name,
    }
  }
  if (value.type !== 'List') {
    throw new RangeError(`Unsupported attribute type: ${value.type}`)
  }
  return {
    color: value.color,
    data: {
      listValues: value.listValues.map((option) => {
        if (option.id === undefined) {
          throw new TypeError('Attribute option id is required')
        }
        return { id: String(option.id), name: option.name }
      }),
      type: 'list',
    },
    id: String(value.id),
    name: value.name,
  }
}

export const createViewAttribute =
  (client: ApiClient): ViewAttribute =>
  ({ attributeId, signal }) =>
    executeQuery({
      map: (attributes) => {
        const attribute = attributes?.find((item) => String(item.id) === attributeId)
        return attribute && mapAttribute(attribute)
      },
      request: () => client.GET('/api/organizations/attributes', { signal }),
    })
