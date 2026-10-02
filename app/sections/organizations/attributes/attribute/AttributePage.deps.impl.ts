import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { ApiError, request } from '#infrastructure/api/request'
import { assertNever } from '~/utils/assertNever'

import type { Attribute, AttributePageDeps } from './AttributePage.deps'

const mapAttribute = (value: components['schemas']['AttributeDto']): Attribute => {
  const base = { color: value.color, id: String(value.id), name: value.name }
  switch (value.type) {
    case 'Text':
      return { ...base, data: { type: 'text' } }
    case 'List':
      return {
        ...base,
        data: {
          listValues: value.listValues.map((option) => ({
            id: String(option.id),
            name: option.name,
          })),
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

export const createAttributePageDeps = (client: ApiClient): AttributePageDeps => ({
  delete: async ({ id }) => {
    await request(
      client.DELETE('/api/admin/organizations/attributes/{id}', {
        params: { path: { id: Number(id) } },
      }),
    )
  },

  update: async ({ color, data, id, name }) => {
    await request(
      client.PUT('/api/admin/organizations/attributes/{id}', {
        body: {
          color,
          id: Number(id),
          listValues:
            data.type === 'list'
              ? data.listValues.map((option) => ({ id: option.id, name: option.name }))
              : null,
          name,
        },
        params: { path: { id: Number(id) } },
      }),
    )
  },

  // There is no endpoint for one attribute, so it is picked out of the list.
  view: async ({ attributeId, signal }) => {
    const attributes = await request(client.GET('/api/organizations/attributes', { signal }))
    const attribute = attributes.find((item) => String(item.id) === attributeId)
    if (!attribute) {
      throw new ApiError(404)
    }
    return mapAttribute(attribute)
  },
})
