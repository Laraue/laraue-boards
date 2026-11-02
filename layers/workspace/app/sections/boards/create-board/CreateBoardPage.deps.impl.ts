import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { DEFAULT_COLOR } from '#layers/workspace/app/shared/constants/colors'
import type { ReadOrganizationCatalog } from '#layers/workspace/app/shells/organization/AppLayout.deps'

import type { CreateBoardPageDeps } from './CreateBoardPage.deps'

export const createCreateBoardPageDeps = (
  client: ApiClient,
  readCatalog: ReadOrganizationCatalog,
): CreateBoardPageDeps => ({
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
    const boards = await request(
      client.POST('/api/epics/get-with-statuses', {
        body: { pagination: { page: 0, perPage: 100 }, spaceKey },
        signal,
      }),
    )
    const space = readCatalog().spaces.find((item) => item.key === spaceKey)
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
      spaceColor: space?.color ?? DEFAULT_COLOR,
      spaceName: space?.name ?? spaceKey,
    }
  },
})
