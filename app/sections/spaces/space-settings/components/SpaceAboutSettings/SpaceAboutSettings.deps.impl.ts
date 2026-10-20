import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { SpaceAboutSettingsDeps } from './SpaceAboutSettings.deps'

export const createSpaceAboutSettingsDeps = (client: ApiClient): SpaceAboutSettingsDeps => ({
  createLink: async ({ description, spaceKey, url }) => {
    const link = await request(
      client.POST('/api/spaces/{key}/links', {
        body: { description, url },
        params: { path: { key: spaceKey } },
      }),
    )
    return { description: link.description, id: String(link.id), url: link.url }
  },

  deleteLink: async ({ id, spaceKey }) => {
    await request(
      client.DELETE('/api/spaces/{key}/links/{id}', {
        params: { path: { id: Number(id), key: spaceKey } },
      }),
    )
  },

  // An empty description clears it.
  saveDescription: async ({ description, spaceKey }) => {
    await request(
      client.PUT('/api/spaces/{key}/description', {
        body: { description: description.trim() || null },
        params: { path: { key: spaceKey } },
      }),
    )
  },

  updateLink: async ({ description, id, spaceKey, url }) => {
    await request(
      client.PUT('/api/spaces/{key}/links/{id}', {
        body: { description, url },
        params: { path: { id: Number(id), key: spaceKey } },
      }),
    )
  },

  view: async ({ signal, spaceKey }) => {
    const about = await request(
      client.GET('/api/spaces/{key}/about', { params: { path: { key: spaceKey } }, signal }),
    )
    return {
      canEdit: about.canEdit,
      description: about.description ?? '',
      links: about.links.map((link) => ({
        description: link.description,
        id: String(link.id),
        url: link.url,
      })),
    }
  },
})
