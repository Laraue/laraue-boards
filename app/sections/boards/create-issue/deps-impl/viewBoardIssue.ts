import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { mapIssueAttributes } from '~/sections/issues/shared/api/issueAttributes'
import { findSpaceByKey } from '~/sections/spaces/shared/findSpaceByKey'

import type { ViewBoardIssue } from '../CreateBoardIssuePage.deps'

export const createViewBoardIssue =
  (client: ApiClient): ViewBoardIssue =>
  async ({ boardId, signal, spaceKey }) => {
    const responses = await tryRequest(() =>
      Promise.all([
        client.GET('/api/epics/{id}', { params: { path: { id: Number(boardId) } }, signal }),
        client.GET('/api/organizations/attributes', { signal }),
        client.GET('/api/spaces', { signal }),
      ]),
    )
    if (!responses) {
      return { code: 0, status: 'error' }
    }
    const [board, attributes, spaces] = responses
    if (!('data' in board) || board.data === undefined) {
      return { code: 'error' in board ? board.response.status : 0, status: 'error' }
    }
    if (!('data' in attributes) || attributes.data === undefined) {
      return { code: 'error' in attributes ? attributes.response.status : 0, status: 'error' }
    }
    if (!('data' in spaces) || spaces.data === undefined) {
      return { code: 'error' in spaces ? spaces.response.status : 0, status: 'error' }
    }
    if (!board.data.canCreateIssues) {
      return { code: 403, status: 'error' }
    }
    const space = findSpaceByKey(spaces.data, spaceKey)
    if (!space) {
      return { code: 404, status: 'error' }
    }

    return {
      data: {
        attributes: mapIssueAttributes(attributes.data),
        boardName: board.data.name,
        spaceId: String(space.id),
      },
      status: 'success',
    }
  }
