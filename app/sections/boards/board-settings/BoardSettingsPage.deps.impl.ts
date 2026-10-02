import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { DEFAULT_COLOR } from '~/constants/colors'

import type {
  BoardSettingsColumn,
  BoardSettingsColumnDraft,
  BoardSettingsPageDeps,
} from './BoardSettingsPage.deps'

const getColumnChanges = (
  originalColumns: BoardSettingsColumn[],
  columns: BoardSettingsColumnDraft[],
) => {
  const currentIds = new Set(columns.flatMap((column) => (column.id === null ? [] : [column.id])))
  return {
    created: columns.filter((column) => column.id === null),
    deleted: originalColumns.filter((column) => !currentIds.has(column.id)),
    updated: columns.filter((column): column is BoardSettingsColumn => {
      if (column.id === null) {
        return false
      }
      const original = originalColumns.find((item) => item.id === column.id)
      return (
        original?.name !== column.name ||
        original.color !== column.color ||
        original.category !== column.category
      )
    }),
  }
}

export const createBoardSettingsPageDeps = (client: ApiClient): BoardSettingsPageDeps => ({
  remove: async ({ boardId }) => {
    await request(client.DELETE('/api/epics/{id}', { params: { path: { id: Number(boardId) } } }))
  },

  save: async (input) => {
    const path = { id: Number(input.boardId) }
    await request(
      client.PUT('/api/epics/{id}', {
        body: { color: input.color, id: input.boardId, name: input.name },
        params: { path },
      }),
    )

    if (input.status !== input.originalStatus) {
      await request(
        client.POST('/api/epics/{id}/status', {
          body: { id: input.boardId, status: input.status },
          params: { path },
        }),
      )
    }

    const changes = getColumnChanges(input.originalColumns, input.columns)
    const createdIds: string[] = []
    for (const { category, color, name } of changes.created) {
      const id = await request(
        client.POST('/api/statuses', { body: { category, color, epicId: input.boardId, name } }),
      )
      createdIds.push(String(id))
    }

    for (const { category, color, id, name } of changes.updated) {
      await request(
        client.PUT('/api/statuses/{id}', {
          body: { category, color, id, name },
          params: { path: { id: Number(id) } },
        }),
      )
    }

    for (const column of changes.deleted) {
      await request(
        client.DELETE('/api/statuses/{id}', { params: { path: { id: Number(column.id) } } }),
      )
    }

    // New columns get their ids in the order they were created.
    let createdIndex = 0
    const columnIds = input.columns.map((column) => column.id ?? createdIds[createdIndex++]!)
    if (columnIds.length > 0) {
      await request(
        client.POST('/api/epics/{id}/reorder-statuses', {
          body: Object.fromEntries(columnIds.map((id, index) => [id, index + 1])),
          params: { path },
        }),
      )
    }
  },

  view: async ({ boardId, signal }) => {
    const board = await request(
      client.GET('/api/epics/{id}', { params: { path: { id: Number(boardId) } }, signal }),
    )
    return {
      canDelete: board.canDelete ?? false,
      canUpdate: board.canUpdate ?? false,
      color: board.color ?? DEFAULT_COLOR,
      columns: (board.statuses ?? [])
        .toSorted((left, right) => Number(left.sortOrder) - Number(right.sortOrder))
        .map((status) => ({
          category: status.category,
          color: status.color ?? DEFAULT_COLOR,
          id: String(status.id),
          name: status.name,
        })),
      name: board.name,
      status: board.status,
    }
  },
})
