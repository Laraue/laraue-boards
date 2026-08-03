import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { LoadStatuses } from '../StatusSelect.deps'

export const createLoadStatuses =
  (client: ApiClient): LoadStatuses =>
  ({ boardId, signal }) => {
    if (!boardId) {
      return Promise.resolve({ data: [], status: 'success' })
    }

    return executeQuery({
      map: (board) =>
        (board?.statuses ?? [])
          .toSorted((left, right) => Number(left.sortOrder) - Number(right.sortOrder))
          .map((status) => ({ label: status.name, value: String(status.id) })),
      request: () =>
        client.GET('/api/epics/{id}', {
          params: { path: { id: Number(boardId) } },
          signal,
        }),
    })
  }
