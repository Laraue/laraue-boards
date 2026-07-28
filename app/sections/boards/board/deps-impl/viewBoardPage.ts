import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import { mapRawIssueFilters } from '~/sections/issues/shared/api/issueAttributes'
import { createdAtDescending } from '~/sections/issues/shared/api/issueSorting'

import type { BoardPageDeps } from '../BoardPage.deps'
import { mapBoardPage } from './mapBoardPage'

export const createViewBoardPage =
  (client: ApiClient): BoardPageDeps['view'] =>
  async ({ attributeQuery, boardId, search, signal }) => {
    const attributes = await executeQuery({
      map: (data) => data,
      request: () => client.GET('/api/organizations/attributes', { signal }),
    })
    if (attributes.status === 'error') {
      return attributes
    }
    const attributeData = mapRawIssueFilters(attributeQuery, attributes.data)
    const [board, issues] = await Promise.all([
      executeQuery({
        map: (data) => data,
        request: () => client.GET('/api/epics/{id}', { params: { path: { id: boardId } }, signal }),
      }),
      executeQuery({
        map: (data) => data,
        request: () =>
          client.POST('/api/issues/board', {
            body: {
              epicId: boardId,
              filters: attributeData.filters,
              searchString: search || undefined,
              sorting: createdAtDescending,
              take: 25,
            },
            signal,
          }),
      }),
    ])
    if (board.status === 'error') {
      return board
    }
    if (issues.status === 'error') {
      return issues
    }
    return {
      data: mapBoardPage(boardId, board.data, issues.data, attributeData.attributes),
      status: 'success',
    }
  }
