import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import {
  mapAttributeSettingsView,
  toAttributeSettingsUpdate,
} from '#layers/workspace/app/shared/components/AttributeSettings/api/attributeSettings'
import { DEFAULT_COLOR } from '#layers/workspace/app/shared/constants/colors'
import type { ReadOrganizationCatalog } from '#layers/workspace/app/shells/organization/AppLayout.deps'

import type { BoardSettingsPageDeps } from './BoardSettingsPage.deps'

export const createBoardSettingsPageDeps = (
  client: ApiClient,
  readCatalog: ReadOrganizationCatalog,
): BoardSettingsPageDeps => ({
  remove: async ({ boardId }) => {
    await request(client.DELETE('/api/epics/{id}', { params: { path: { id: Number(boardId) } } }))
  },

  save: async ({ attributeSettings, boardId, color, columns, name }) => {
    await request(
      client.PUT('/api/epics/{id}', {
        body: {
          attributeSettings: toAttributeSettingsUpdate(attributeSettings),
          color,
          columns: columns.map((column) => ({
            category: column.category,
            color: column.color,
            id: column.id === null ? null : Number(column.id),
            name: column.name,
          })),
          id: Number(boardId),
          name,
        },
        params: { path: { id: Number(boardId) } },
      }),
    )
  },

  view: async ({ boardId, signal, spaceKey }) => {
    // The board doesn't carry its space's name; the layout's spaces list does.
    const path = { id: Number(boardId) }
    const [board, attributeSettings] = await Promise.all([
      request(client.GET('/api/epics/{id}', { params: { path }, signal })),
      request(client.GET('/api/epics/{id}/attribute-settings', { params: { path }, signal })),
    ])
    const space = readCatalog().spaces.find((item) => item.key === spaceKey)
    return {
      attributeSettings: mapAttributeSettingsView(attributeSettings),
      canDelete: board.canDelete,
      canUpdate: board.canUpdate,
      color: board.color ?? DEFAULT_COLOR,
      columns: board.statuses
        .toSorted((left, right) => left.sortOrder - right.sortOrder)
        .map((status) => ({
          category: status.category,
          color: status.color ?? DEFAULT_COLOR,
          id: String(status.id),
          name: status.name,
        })),
      isDefault: board.isDefault,
      name: board.name,
      spaceColor: space?.color ?? DEFAULT_COLOR,
      spaceName: space?.name ?? spaceKey,
    }
  },
})
