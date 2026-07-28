import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'

import type { MoveIssues } from '../MoveIssuesDialog.deps'

export const createMoveIssues =
  (client: ApiClient): MoveIssues =>
  async ({ issueKeys, statusId }) => {
    if (!issueKeys.length || !statusId) {
      return { code: 400, status: 'error' }
    }

    const responses = await tryRequest(() =>
      Promise.all(
        issueKeys.map((issueKey) =>
          client.POST('/api/movement/issue/{key}/move-to-status/{statusId}', {
            params: { path: { key: issueKey, statusId: Number(statusId) } },
          }),
        ),
      ),
    )
    if (!responses) {
      return { code: 0, status: 'error' }
    }
    for (const response of responses) {
      if ('error' in response) {
        return { code: response.response.status, status: 'error' }
      }
    }

    return { data: true, status: 'success' }
  }
