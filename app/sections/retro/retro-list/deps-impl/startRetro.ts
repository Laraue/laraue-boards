import type { RetroApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { RetroListPageDeps } from '../RetroListPage.deps'

export const createStartRetro =
  (client: RetroApiClient): RetroListPageDeps['startRetro'] =>
  ({ basedOnRetroId, name }) =>
    executeAction({
      map: (created) => (created ? { retroId: String(created.id) } : undefined),
      request: () =>
        client.POST('/api/retro', {
          body: {
            basedOnRetroId: basedOnRetroId === null ? null : Number(basedOnRetroId),
            name,
          },
        }),
    })
