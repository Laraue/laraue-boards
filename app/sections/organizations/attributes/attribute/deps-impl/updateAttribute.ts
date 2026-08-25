import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'
import { assertNever } from '~/utils/assertNever'

import type { UpdateAttribute } from '../AttributePage.deps'

export const createUpdateAttribute =
  (client: ApiClient): UpdateAttribute =>
  (input) => {
    const listValues = (() => {
      switch (input.data.type) {
        case 'text':
          return null
        case 'list':
          return input.data.listValues.map((option) => ({ id: option.id, name: option.name }))
        case 'integer':
          return null
        case 'decimal':
          return null
        case 'date':
          return null
        case 'dateTime':
          return null
        default:
          return assertNever(input.data)
      }
    })()
    return executeAction({
      map: () => true,
      request: () =>
        client.PUT('/api/admin/organizations/attributes/{id}', {
          body: {
            color: input.color,
            id: Number(input.id),
            listValues,
            name: input.name,
          },
          params: { path: { id: Number(input.id) } },
        }),
    })
  }
