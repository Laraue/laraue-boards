import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { tryRequest } from '#infrastructure/api/tryRequest'

import type { SaveBoardSettings } from '../BoardSettingsPage.deps'
import type { BoardSettingsColumn, BoardSettingsColumnDraft } from '../BoardSettingsPage.types'

type SaveFailure =
  | { code: number; status: 'error' }
  | { message: string; status: 'validation-error' }

type Response = undefined | { data?: unknown; error?: unknown; response: globalThis.Response }

const toSaveFailure = (response: Response): SaveFailure | undefined => {
  if (!response) {
    return { code: 0, status: 'error' }
  }
  if ('data' in response) {
    return undefined
  }
  if (response.response.status === 400) {
    return { message: getInvalidInputError(response.error).message, status: 'validation-error' }
  }
  return { code: response.response.status, status: 'error' }
}

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
      return original?.name !== column.name || original.color !== column.color
    }),
  }
}

const getColumnSortOrders = (columnIds: string[]) =>
  Object.fromEntries(columnIds.map((id, index) => [id, index + 1]))

export const createSaveBoardSettings =
  (client: ApiClient): SaveBoardSettings =>
  async (input) => {
    const board = await tryRequest(() =>
      client.PUT('/api/epics/{id}', {
        body: { color: input.color, id: input.boardId, name: input.name },
        params: { path: { id: Number(input.boardId) } },
      }),
    )
    const boardFailure = toSaveFailure(board)
    if (boardFailure) {
      return boardFailure
    }

    const changes = getColumnChanges(input.originalColumns, input.columns)
    const createdIds: string[] = []
    for (const column of changes.created) {
      const response = await tryRequest(() =>
        client.POST('/api/statuses', {
          body: { color: column.color, epicId: input.boardId, name: column.name },
        }),
      )
      if (response && 'data' in response && response.data !== undefined) {
        createdIds.push(String(response.data))
        continue
      }
      return toSaveFailure(response) ?? { code: 0, status: 'error' }
    }

    for (const column of changes.updated) {
      const response = await tryRequest(() =>
        client.PUT('/api/statuses/{id}', {
          body: { color: column.color, id: column.id, name: column.name },
          params: { path: { id: Number(column.id) } },
        }),
      )
      const failure = toSaveFailure(response)
      if (failure) {
        return failure
      }
    }

    for (const column of changes.deleted) {
      const response = await tryRequest(() =>
        client.DELETE('/api/statuses/{id}', { params: { path: { id: Number(column.id) } } }),
      )
      const failure = toSaveFailure(response)
      if (failure) {
        return failure
      }
    }

    let createdIndex = 0
    const columnIds = input.columns.flatMap((column) => {
      if (column.id !== null) {
        return [column.id]
      }
      const id = createdIds[createdIndex]
      createdIndex += 1
      return id === undefined ? [] : [id]
    })
    if (columnIds.length > 0) {
      const response = await tryRequest(() =>
        client.POST('/api/epics/{id}/reorder-statuses', {
          body: getColumnSortOrders(columnIds),
          params: { path: { id: Number(input.boardId) } },
        }),
      )
      const failure = toSaveFailure(response)
      if (failure) {
        return failure
      }
    }

    return { data: true, status: 'success' }
  }
