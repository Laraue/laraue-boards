import type { ApiClient } from '#infrastructure/api/client'
import { isErrorResponse, tryRequest } from '#infrastructure/api/tryRequest'
import { mapIssueAttributes } from '~/sections/issues/shared/api/issueAttributes'

import type { ViewBoardIssue } from '../CreateBoardIssuePage.deps'

export const createViewBoardIssue =
  (client: ApiClient): ViewBoardIssue =>
  async ({ boardId, signal, spaceKey }) => {
    const responses = await tryRequest(() =>
      Promise.all([
        client.GET('/api/epics/{id}', { params: { path: { id: Number(boardId) } }, signal }),
        client.GET('/api/organizations/attributes', { signal }),
      ]),
    )
    if (!responses) {
      return { code: 0, status: 'error' }
    }
    const [board, attributes] = responses
    if (isErrorResponse(board)) {
      return { code: board.response.status, status: 'error' }
    }
    if (board.data === undefined) {
      return { code: 0, status: 'error' }
    }
    if (isErrorResponse(attributes)) {
      return {
        code: attributes.response.status,
        status: 'error',
      }
    }
    if (attributes.data === undefined) {
      return { code: 0, status: 'error' }
    }
    if (!board.data.canCreateIssues) {
      return { code: 403, status: 'error' }
    }
    return {
      data: {
        attributes: mapIssueAttributes(attributes.data),
        boardName: board.data.name,
        spaceKey,
      },
      status: 'success',
    }
  }
