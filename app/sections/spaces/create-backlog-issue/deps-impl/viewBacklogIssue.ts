import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { mapIssueAttributes } from '~/sections/issues/shared/api/issueAttributes'
import { findSpaceByKey } from '~/sections/spaces/shared/findSpaceByKey'

import type { ViewBacklogIssue } from '../CreateBacklogIssuePage.deps'

export const createViewBacklogIssue =
  (client: ApiClient): ViewBacklogIssue =>
  async ({ signal, spaceKey }) => {
    const responses = await tryRequest(() =>
      Promise.all([
        client.GET('/api/spaces', { signal }),
        client.GET('/api/organizations/attributes', { signal }),
      ]),
    )
    if (!responses) {
      return { code: 0, status: 'error' }
    }
    const [spaces, attributes] = responses
    if (!('data' in spaces) || spaces.data === undefined) {
      return { code: 'error' in spaces ? spaces.response.status : 0, status: 'error' }
    }
    if (!('data' in attributes) || attributes.data === undefined) {
      return { code: 'error' in attributes ? attributes.response.status : 0, status: 'error' }
    }

    const space = findSpaceByKey(spaces.data, spaceKey)
    if (!space) {
      return { code: 404, status: 'error' }
    }

    const boards = await tryRequest(() =>
      client.GET('/api/spaces/{key}/epics', { params: { path: { key: spaceKey } }, signal }),
    )
    if (!boards || !('data' in boards) || boards.data === undefined) {
      return { code: boards && 'error' in boards ? boards.response.status : 0, status: 'error' }
    }
    const backlog = boards.data.find((board) => board.isDefault)
    if (!backlog) {
      return { code: 404, status: 'error' }
    }

    const board = await tryRequest(() =>
      client.GET('/api/epics/{id}', { params: { path: { id: Number(backlog.id) } }, signal }),
    )
    if (!board || !('data' in board) || board.data === undefined) {
      return { code: board && 'error' in board ? board.response.status : 0, status: 'error' }
    }
    if (!board.data.canCreateIssues) {
      return { code: 403, status: 'error' }
    }

    return {
      data: {
        attributes: mapIssueAttributes(attributes.data),
        boardId: String(backlog.id),
        boardName: backlog.name,
        spaceKey,
      },
      status: 'success',
    }
  }
