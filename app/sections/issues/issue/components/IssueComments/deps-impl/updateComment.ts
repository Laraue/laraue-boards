import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { UpdateComment } from '../IssueComments.deps'

export const createUpdateComment =
  (client: ApiClient): UpdateComment =>
  ({ id, text }) => {
    const body = new FormData()
    body.set('Text', text)
    return executeAction({
      map: () => true,
      request: () =>
        client.PUT('/api/issues/comments/{id}', {
          body: {},
          bodySerializer: () => body,
          params: { path: { id: Number(id) } },
        }),
    })
  }
