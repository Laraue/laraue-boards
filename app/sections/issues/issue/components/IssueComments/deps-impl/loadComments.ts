import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { LoadComments } from '../IssueComments.deps'
import { mapIssueComment } from './mapComment'

export const createLoadComments =
  (client: ApiClient): LoadComments =>
  ({ issueKey, signal }) =>
    executeQuery({
      map: (result) => (result === undefined ? undefined : result.data.map(mapIssueComment)),
      request: () =>
        client.POST('/api/issues/{key}/comments', {
          body: { pagination: { page: 0, perPage: 100 } },
          params: { path: { key: issueKey } },
          signal,
        }),
    })
