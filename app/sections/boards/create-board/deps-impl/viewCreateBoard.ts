import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { CreateBoardPageDeps } from '../CreateBoardPage.deps'

export const createViewCreateBoard =
  (client: ApiClient): CreateBoardPageDeps['view'] =>
  ({ signal, spaceKey }) =>
    executeQuery({
      map: (boards) => ({
        boards:
          boards?.data.map((board) => ({
            label: board.epicName,
            statuses: board.statuses.map((status) => ({
              color: status.color ?? '#808080',
              name: status.name,
            })),
            value: String(board.epicId),
          })) ?? [],
      }),
      request: () =>
        client.POST('/api/epics/get-with-statuses', {
          body: {
            pagination: { page: 0, perPage: 100 },
            spaceKey,
          },
          signal,
        }),
    })
