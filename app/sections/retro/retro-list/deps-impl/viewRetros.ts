import type { RetroApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'

import type { RetroListPageDeps } from '../RetroListPage.deps'

export const createViewRetros =
  (client: RetroApiClient): RetroListPageDeps['view'] =>
  ({ signal }) =>
    executeQuery({
      map: (retros) =>
        retros?.map((retro) => ({
          cardCount: Number(retro.cardCount),
          createdAt: retro.createdAt,
          finished: retro.finishedAt !== null,
          id: String(retro.id),
          name: retro.name,
        })),
      request: () => client.GET('/api/retro', { signal }),
    })
