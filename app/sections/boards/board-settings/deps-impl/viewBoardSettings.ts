import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import { DEFAULT_COLOR } from '~/constants/colors'

import type { ViewBoardSettings } from '../BoardSettingsPage.deps'

export const createViewBoardSettings =
  (client: ApiClient): ViewBoardSettings =>
  ({ boardId, signal }) =>
    executeQuery({
      map: (board) =>
        board && {
          canDelete: board.canDelete ?? false,
          canUpdate: board.canUpdate ?? false,
          color: board.color ?? DEFAULT_COLOR,
          columns: (board.statuses ?? [])
            .toSorted((left, right) => Number(left.sortOrder) - Number(right.sortOrder))
            .map((status) => ({
              color: status.color ?? DEFAULT_COLOR,
              id: String(status.id),
              name: status.name,
            })),
          name: board.name,
        },
      request: () =>
        client.GET('/api/epics/{id}', { params: { path: { id: Number(boardId) } }, signal }),
    })
