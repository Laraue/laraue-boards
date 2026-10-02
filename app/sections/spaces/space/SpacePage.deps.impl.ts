import type { ApiClient } from '#infrastructure/api/client'
import { ApiError, request } from '#infrastructure/api/request'
import { COLORS } from '~/constants/colors'

import type { SpacePageDeps } from './SpacePage.deps'

export const createSpacePageDeps = (client: ApiClient): SpacePageDeps => ({
  view: async ({ signal, spaceKey }) => {
    const path = { key: spaceKey }
    const [spaces, details, boards, boardStatuses] = await Promise.all([
      request(client.GET('/api/spaces', { signal })),
      request(client.GET('/api/spaces/{key}', { params: { path }, signal })),
      request(
        client.GET('/api/issues/summary', { params: { query: { SpaceKey: spaceKey } }, signal }),
      ),
      request(client.GET('/api/spaces/{key}/epics', { params: { path }, signal })),
    ])
    const space = spaces.find((item) => item.key === spaceKey)
    if (!space) {
      throw new ApiError(404)
    }
    return {
      // Newest first; the backlog is the default board and keeps the space's own color.
      boards: boards
        .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((board) => ({
          color: board.color ?? (board.isDefault ? space.color : COLORS.gray),
          id: String(board.id),
          issueCount: board.columns.reduce((sum, column) => sum + Number(column.count), 0),
          kind: board.isDefault ? 'backlog' : 'board',
          name: board.isDefault ? 'Backlog' : board.name,
          status:
            boardStatuses.find((item) => String(item.id) === String(board.id))?.status ?? 'New',
          statuses: board.columns.map((column) => ({
            color: column.color ?? COLORS.gray,
            count: Number(column.count),
            name: column.name,
          })),
        })),
      canCreateBoards: details.canCreateEpics,
      canManage: details.canUpdate || details.canDelete,
      color: space.color,
      name: space.name,
    }
  },
})
