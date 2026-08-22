import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'

import type { ViewAttribute } from '../AttributePage.deps'
import type { Attribute } from '../AttributePage.types'

const mapAttribute = (value: components['schemas']['AttributeDto']): Attribute => {
  if (value.id === undefined) {
    throw new TypeError('Attribute id is required')
  }
  if (value.type !== 'List') {
    const types = {
      Date: 'date',
      DateTime: 'dateTime',
      Decimal: 'decimal',
      Integer: 'integer',
      Text: 'text',
    } as const
    return {
      color: value.color,
      data: { type: types[value.type] },
      id: String(value.id),
      name: value.name,
    }
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
