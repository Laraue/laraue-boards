import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'
import { assertNever } from '~/utils/assertNever'

import type { ViewAttribute } from '../AttributePage.deps'
import type { Attribute } from '../AttributePage.types'

const mapAttribute = (value: components['schemas']['AttributeDto']): Attribute => {
  if (value.id === undefined) {
    throw new TypeError('Attribute id is required')
  }
  const base = {
    color: value.color,
    id: String(value.id),
    name: value.name,
  }
  switch (value.type) {
    case 'Text':
      return { ...base, data: { type: 'text' } }
    case 'List':
      return {
        ...base,
        data: {
          listValues: value.listValues.map((option) => {
            if (option.id === undefined) {
              throw new TypeError('Attribute option id is required')
            }
            return { id: String(option.id), name: option.name }
          }),
          type: 'list',
        },
      }
    case 'Integer':
      return { ...base, data: { type: 'integer' } }
    case 'Decimal':
      return { ...base, data: { type: 'decimal' } }
    case 'Date':
      return { ...base, data: { type: 'date' } }
    case 'DateTime':
      return { ...base, data: { type: 'dateTime' } }
    default:
      return assertNever(value.type)
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
