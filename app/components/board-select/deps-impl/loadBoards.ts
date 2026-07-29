import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { LoadBoards } from '../BoardSelect.deps'

export const createLoadBoards =
  (client: ApiClient): LoadBoards =>
  ({ signal, spaceKey }) =>
    executeQuery({
      map: (boards) => boards?.map((board) => ({ label: board.name, value: String(board.id) })),
      request: () =>
        client.GET('/api/spaces/{key}/epics', {
          params: { path: { key: spaceKey } },
          signal,
        }),
    })
