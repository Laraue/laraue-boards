import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { DeleteComment } from '../IssueComments.deps'

export const createDeleteComment =
  (client: ApiClient): DeleteComment =>
  ({ id }) =>
    executeAction({
      map: () => true,
      request: () =>
        client.DELETE('/api/issues/comments/{id}', { params: { path: { id: Number(id) } } }),
    })
