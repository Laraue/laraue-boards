import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { CreateAttribute } from '../CreateAttributePage.deps'

const types = {
  date: 'Date',
  dateTime: 'DateTime',
  decimal: 'Decimal',
  integer: 'Integer',
  list: 'List',
  text: 'Text',
} as const

export const createCreateAttribute =
  (client: ApiClient): CreateAttribute =>
  (input) =>
    executeAction({
      map: (id) => (id === undefined ? undefined : { id: String(id) }),
      request: () =>
        client.POST('/api/organizations/attributes', {
          body: {
            color: input.color,
            listValues:
              input.data.type === 'list' ? input.data.listValues.map((name) => ({ name })) : null,
            name: input.name,
            type: types[input.data.type],
          },
        }),
    })
