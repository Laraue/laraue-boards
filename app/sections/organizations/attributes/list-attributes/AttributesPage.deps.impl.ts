import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { request } from '#infrastructure/api/request'
import { assertNever } from '~/utils/assertNever'

import type { AttributeListItem, AttributesPageDeps } from './AttributesPage.deps'

const mapType = (type: components['schemas']['AttributeType']): AttributeListItem['type'] => {
  switch (type) {
    case 'Text':
      return 'text'
    case 'List':
      return 'list'
    case 'Integer':
      return 'integer'
    case 'Decimal':
      return 'decimal'
    case 'Date':
      return 'date'
    case 'DateTime':
      return 'dateTime'
    default:
      return assertNever(type)
  }
}

export const createAttributesPageDeps = (client: ApiClient): AttributesPageDeps => ({
  view: async ({ signal }) => {
    const attributes = await request(client.GET('/api/organizations/attributes', { signal }))
    return attributes.map((attribute) => ({
      color: attribute.color,
      id: String(attribute.id),
      name: attribute.name,
      type: mapType(attribute.type),
    }))
  },
})
