import type { RetroApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { RetroListPageDeps } from '../RetroListPage.deps'

export const createViewRetros =
  (client: RetroApiClient): RetroListPageDeps['view'] =>
  ({ page, signal }) =>
    executeQuery({
      map: (result) => {
        if (!result) {
          return undefined
        }
        return {
          canCreate: result.canCreate,
          hasNextPage: result.hasNextPage,
          retros: result.data.map((retro) => ({
            canManage: retro.canManage,
            cardCount: Number(retro.cardCount),
            createdAt: retro.createdAt,
            finished: retro.finishedAt !== null,
            id: String(retro.id),
            name: retro.name,
            openActionCount: Number(retro.openActionCount),
          })),
        }
      },
      request: () =>
        client.POST('/api/retro/list', {
          body: { pagination: { page: page - 1, perPage: 10 } },
          signal,
        }),
    })
