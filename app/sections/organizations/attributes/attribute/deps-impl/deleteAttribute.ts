import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { DeleteAttribute } from '../AttributePage.deps'

export const createDeleteAttribute =
  (client: ApiClient): DeleteAttribute =>
  ({ id }) =>
    executeAction({
      map: () => true,
      request: () =>
        client.DELETE('/api/admin/organizations/attributes/{id}', {
          params: { path: { id: Number(id) } },
        }),
    })
