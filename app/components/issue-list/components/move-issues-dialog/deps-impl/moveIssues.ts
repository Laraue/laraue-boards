import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { MoveIssues } from '../MoveIssuesDialog.deps'

export const createMoveIssues =
  (client: ApiClient): MoveIssues =>
  async ({ issueKeys, statusId }) => {
    if (!issueKeys.length || !statusId) {
      return { code: 400, status: 'error' }
    }

    return executeAction({
      map: () => true,
      request: () =>
        client.POST('/api/issues/status', { body: { issueKeys, statusId: Number(statusId) } }),
    })
  }
