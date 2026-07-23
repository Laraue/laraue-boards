import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { BoardPageDeps } from '../BoardPage.deps'

export const createMoveBoardIssue =
  (client: ApiClient): BoardPageDeps['moveBoardIssue'] =>
  async ({ issueKey, statusId }) => {
    if (!statusId) {
      return { message: 'This issue cannot be moved to that column.', status: 'validation-error' }
    }
    return executeAction({
      map: () => true,
      request: () =>
        client.POST('/api/movement/issue/{key}/move-to-status/{statusId}', {
          params: { path: { key: issueKey, statusId: Number(statusId) } },
        }),
    })
  }
