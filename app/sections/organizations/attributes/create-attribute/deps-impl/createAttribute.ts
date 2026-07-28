import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { CreateAttribute } from '../CreateAttributePage.deps'

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
            type: input.data.type === 'list' ? 'List' : 'Text',
          },
        }),
    })
