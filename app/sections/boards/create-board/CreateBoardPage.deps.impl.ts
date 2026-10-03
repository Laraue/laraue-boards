import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { CreateBoardPageDeps } from './CreateBoardPage.deps'

export const createCreateBoardPageDeps = (client: ApiClient): CreateBoardPageDeps => ({
  create: async ({ color, name, spaceKey, statuses }) =>
    String(
      await request(
        client.POST('/api/epics', {
          body: { color, name, spaceKey, statuses },
          parseAs: 'text',
        }),
      ),
    ),

  view: async ({ signal, spaceKey }) => {
    const [boards, spaces] = await Promise.all([
      request(
        client.POST('/api/epics/get-with-statuses', {
          body: { pagination: { page: 0, perPage: 100 }, spaceKey },
          signal,
        }),
      ),
      request(client.GET('/api/spaces', { signal })),
    ])
    return {
      boards: boards.data.map((board) => ({
        label: board.epicName,
        statuses: board.statuses.map((status) => ({
          category: status.category,
          color: status.color ?? '#808080',
          name: status.name,
        })),
        value: String(board.epicId),
      })),
      spaceName: spaces.find((space) => space.key === spaceKey)?.name ?? spaceKey,
    }
  },
})
