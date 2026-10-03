import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { COLORS } from '~/constants/colors'

import type { StatusSelectDeps } from './StatusSelect.deps'

export const createStatusSelectDeps = (client: ApiClient): StatusSelectDeps => ({
  // No board picked yet means no statuses, without asking the API.
  loadStatuses: async ({ boardId, signal }) => {
    if (!boardId) {
      return []
    }
    const board = await request(
      client.GET('/api/epics/{id}', { params: { path: { id: Number(boardId) } }, signal }),
    )
    return (board.statuses ?? [])
      .toSorted((left, right) => Number(left.sortOrder) - Number(right.sortOrder))
      .map((status) => ({
        color: status.color ?? COLORS.gray,
        label: status.name,
        value: String(status.id),
      }))
  },
})
