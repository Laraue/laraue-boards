import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { BoardPageDeps } from '../BoardPage.deps'

export const createMoveIssueToBacklog =
  (client: ApiClient): BoardPageDeps['moveIssueToBacklog'] =>
  async ({ boardId, issueKey, spaceKey }) => {
    const boards = await executeQuery({
      map: (data) => data,
      request: () =>
        client.GET('/api/spaces/{key}/epics', {
          params: { path: { key: spaceKey } },
        }),
    })
    if (boards.status === 'error') {
      return boards
    }
    const current = boards.data.find((board) => String(board.id) === boardId)
    const backlog = boards.data.find((board) => board.isDefault)
    if (!current || !backlog) {
      return { code: 404, status: 'error' }
    }
    if (current.id === backlog.id) {
      return { message: 'This issue is already in the backlog.', status: 'validation-error' }
    }
    const response = await executeQuery({
      map: (data) => data,
      request: () =>
        client.GET('/api/epics/{id}', {
          params: { path: { id: Number(backlog.id) } },
        }),
    })
    if (response.status === 'error') {
      return response
    }
    const status = (response.data.statuses ?? []).toSorted(
      (left, right) => Number(left.sortOrder) - Number(right.sortOrder),
    )[0]
    if (!status) {
      return { code: 500, status: 'error' }
    }
    return executeAction({
      map: () => true,
      request: () =>
        client.POST('/api/issues/status', {
          body: { issueKeys: [issueKey], statusId: Number(status.id) },
        }),
    })
  }
