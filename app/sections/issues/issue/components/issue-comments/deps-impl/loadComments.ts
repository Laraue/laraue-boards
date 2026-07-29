import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { LoadComments } from '../IssueComments.deps'
import { mapIssueComment } from './mapComment'

export const createLoadComments =
  (client: ApiClient): LoadComments =>
  ({ issueKey, signal }) =>
    executeQuery({
      map: (issue) => (issue === undefined ? undefined : issue.comments.map(mapIssueComment)),
      request: () =>
        client.GET('/api/issues/{key}', { params: { path: { key: issueKey } }, signal }),
    })
