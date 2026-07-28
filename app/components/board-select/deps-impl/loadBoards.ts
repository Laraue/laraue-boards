import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { LoadBoards } from '../BoardSelect.deps'

export const createLoadBoards =
  (client: ApiClient): LoadBoards =>
  ({ signal, spaceId }) =>
    executeQuery({
      map: (boards) => boards?.map((board) => ({ label: board.name, value: String(board.id) })),
      request: () =>
        client.GET('/api/spaces/{id}/epics', {
          params: { path: { id: Number(spaceId) } },
          signal,
        }),
    })
