import type { RetroApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { RetroListPageDeps } from './RetroListPage.deps'

export const createRetroListPageDeps = (client: RetroApiClient): RetroListPageDeps => ({
  removeRetro: async ({ retroId }) => {
    await request(client.DELETE('/api/retro/{id}', { params: { path: { id: Number(retroId) } } }))
  },

  startRetro: async ({ basedOnRetroId, name }) => {
    const created = await request(
      client.POST('/api/retro', {
        body: { basedOnRetroId: basedOnRetroId === null ? null : Number(basedOnRetroId), name },
      }),
    )
    return String(created.id)
  },

  view: async ({ page, signal }) => {
    const result = await request(
      client.POST('/api/retro/list', {
        body: { pagination: { page: page - 1, perPage: 10 } },
        signal,
      }),
    )
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
})
