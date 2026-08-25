import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'
import { assertNever } from '~/utils/assertNever'

import type { CreateAttribute } from '../CreateAttributePage.deps'

export const createCreateAttribute =
  (client: ApiClient): CreateAttribute =>
  (input) => {
    const data = (() => {
      switch (input.data.type) {
        case 'text':
          return { listValues: null, type: 'Text' as const }
        case 'list':
          return {
            listValues: input.data.listValues.map((name) => ({ name })),
            type: 'List' as const,
          }
        case 'integer':
          return { listValues: null, type: 'Integer' as const }
        case 'decimal':
          return { listValues: null, type: 'Decimal' as const }
        case 'date':
          return { listValues: null, type: 'Date' as const }
        case 'dateTime':
          return { listValues: null, type: 'DateTime' as const }
        default:
          return assertNever(input.data)
      }
    })()
    return executeAction({
      map: (id) => (id === undefined ? undefined : { id: String(id) }),
      request: () =>
        client.POST('/api/admin/organizations/attributes', {
          body: {
            color: input.color,
            listValues: data.listValues,
            name: input.name,
            type: data.type,
          },
        }),
    })
  }
