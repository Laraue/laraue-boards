import type { ApiClient } from '#infrastructure/api/client'
import { ApiError, request } from '#infrastructure/api/request'

import type { SpaceSettingsPageDeps } from './SpaceSettingsPage.deps'

export const createSpaceSettingsPageDeps = (client: ApiClient): SpaceSettingsPageDeps => ({
  remove: async ({ spaceKey }) => {
    await request(client.DELETE('/api/spaces/{key}', { params: { path: { key: spaceKey } } }))
  },

  // One request: the settings, description and links are saved together or not at all.
  save: async ({ color, description, links, name, newKey, oldKey }) => {
    await request(
      client.PUT('/api/spaces/{key}', {
        body: {
          color,
          description,
          links: links.map((link) => ({
            description: link.description,
            url: link.url,
          })),
          name,
          newKey,
          oldKey,
        },
        params: { path: { key: oldKey } },
      }),
    )
  },

  // The name and color live in the space list, the permissions in the space itself, the description and links in
  // its about.
  view: async ({ signal, spaceKey }) => {
    const path = { key: spaceKey }
    const [spaces, details, about] = await Promise.all([
      request(client.GET('/api/spaces', { signal })),
      request(client.GET('/api/spaces/{key}', { params: { path }, signal })),
      request(client.GET('/api/spaces/{key}/about', { params: { path }, signal })),
    ])
    const space = spaces.find((item) => item.key === spaceKey)
    if (!space) {
      throw new ApiError(404)
    }
    return {
      canDelete: details.canDelete,
      canUpdate: details.canUpdate,
      color: space.color,
      description: about.description ?? '',
      links: about.links.map((link) => ({
        description: link.description,
        id: String(link.id),
        url: link.url,
      })),
      name: space.name,
    }
  },
})
