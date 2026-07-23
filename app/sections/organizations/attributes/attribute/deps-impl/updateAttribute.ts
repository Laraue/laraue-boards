import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { UpdateAttribute } from '../AttributePage.deps'

export const createUpdateAttribute =
  (client: ApiClient): UpdateAttribute =>
  (input) =>
    executeAction({
      map: () => true,
      request: () =>
        client.PUT('/api/organizations/attributes/{id}', {
          body: {
            color: input.color,
            id: Number(input.id),
            listValues:
              input.data.type === 'list'
                ? input.data.listValues.map((option) => ({
                    id: option.id,
                    name: option.name,
                  }))
                : null,
            name: input.name,
          },
          params: { path: { id: Number(input.id) } },
        }),
    })
