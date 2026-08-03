import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { CreateComment } from '../IssueComments.deps'

export const createCreateComment =
  (client: ApiClient): CreateComment =>
  ({ issueKey, text }) => {
    const body = new FormData()
    body.set('IssueKey', issueKey)
    body.set('Text', text)
    return executeAction({
      map: () => true,
      request: () => client.POST('/api/issues/comments', { body: {}, bodySerializer: () => body }),
    })
  }
