import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { DeleteIssue } from '../IssuePage.deps'

export const createDeleteIssue =
  (client: ApiClient): DeleteIssue =>
  ({ issueKey }) =>
    executeAction({
      map: () => true,
      request: () => client.DELETE('/api/issues/{key}', { params: { path: { key: issueKey } } }),
    })
