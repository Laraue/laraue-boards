import type { ApiClient } from '#infrastructure/api/client'
import { ApiError, request } from '#infrastructure/api/request'

import type { SpaceSettingsPageDeps } from './SpaceSettingsPage.deps'

export const createSpaceSettingsPageDeps = (client: ApiClient): SpaceSettingsPageDeps => ({
  remove: async ({ spaceKey }) => {
    await request(client.DELETE('/api/spaces/{key}', { params: { path: { key: spaceKey } } }))
  },

  // Everything under the old key first: removed links before new ones, so a URL can move to a new row; the space
  // itself last, since a new key moves it.
  save: async ({ color, description, links, name, newKey, oldKey, saved }) => {
    const path = { key: oldKey }
    const kept = new Set(links.map((link) => link.id).filter(Boolean))

    for (const link of saved.links.filter((item) => !kept.has(item.id))) {
      await request(
        client.DELETE('/api/spaces/{key}/links/{id}', {
          params: { path: { ...path, id: Number(link.id) } },
        }),
      )
    }

    for (const link of links) {
      const before = saved.links.find((item) => item.id === link.id)
      if (
        link.id &&
        before &&
        (before.url !== link.url || before.description !== link.description)
      ) {
        await request(
          client.PUT('/api/spaces/{key}/links/{id}', {
            body: { description: link.description, url: link.url },
            params: { path: { ...path, id: Number(link.id) } },
          }),
        )
      }
    }

    for (const link of links.filter((item) => !item.id)) {
      await request(
        client.POST('/api/spaces/{key}/links', {
          body: { description: link.description, url: link.url },
          params: { path },
        }),
      )
    }

    if (description.trim() !== saved.description.trim()) {
      await request(
        client.PUT('/api/spaces/{key}/description', {
          body: { description: description.trim() || null },
          params: { path },
        }),
      )
    }

    await request(
      client.PUT('/api/spaces/{key}', {
        body: { color, name, newKey, oldKey },
        params: { path },
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
