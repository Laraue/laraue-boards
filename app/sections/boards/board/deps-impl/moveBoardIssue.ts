import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { BoardPageDeps } from '../BoardPage.deps'

export const createMoveBoardIssue =
  (client: ApiClient): BoardPageDeps['moveBoardIssue'] =>
  async ({ issueKey, statusId, target, updateStatus }) => {
    if (updateStatus && !statusId) {
      return { message: 'This issue cannot be moved to that column.', status: 'validation-error' }
    }
    if (!updateStatus && !target) {
      return { data: true, status: 'success' }
    }
    return executeAction({
      map: () => true,
      request: async () => {
        const statusResponse = updateStatus
          ? await client.POST('/api/issues/status', {
              body: { issueKeys: [issueKey], statusId: Number(statusId) },
            })
          : undefined
        if (statusResponse && !('data' in statusResponse)) {
          return statusResponse
        }
        if (!target) {
          return statusResponse
        }
        return client.POST('/api/issues/order', {
          body: { issueKeys: [issueKey], targetKey: target.issueKey, targetType: target.position },
        })
      },
    })
  }
