import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { DEFAULT_COLOR } from '~/constants/colors'

import type { BoardSelectDeps } from './BoardSelect.deps'

export const createBoardSelectDeps = (client: ApiClient): BoardSelectDeps => ({
  loadBoards: async ({ signal, spaceKey }) => {
    const boards = await request(
      client.GET('/api/spaces/{key}/epics', { params: { path: { key: spaceKey } }, signal }),
    )
    return boards.map((board) => ({
      color: board.color ?? DEFAULT_COLOR,
      isBacklog: board.isDefault,
      label: board.name,
      value: String(board.id),
    }))
  },
})
