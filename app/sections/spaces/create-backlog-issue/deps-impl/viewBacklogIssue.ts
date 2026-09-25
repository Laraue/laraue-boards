import type { ApiClient } from '#infrastructure/api/client'
import { isErrorResponse, tryRequest } from '#infrastructure/api/tryRequest'
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
    if (isErrorResponse(spaces)) {
      return { code: spaces.response.status, status: 'error' }
    }
    if (spaces.data === undefined) {
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

    const space = findSpaceByKey(spaces.data, spaceKey)
    if (!space) {
      return { code: 404, status: 'error' }
    }

    const boards = await tryRequest(() =>
      client.GET('/api/spaces/{key}/epics', { params: { path: { key: spaceKey } }, signal }),
    )
    if (!boards) {
      return { code: 0, status: 'error' }
    }
    if (isErrorResponse(boards)) {
      return {
        code: boards.response.status,
        status: 'error',
      }
    }
    if (boards.data === undefined) {
      return { code: 0, status: 'error' }
    }
    const backlog = boards.data.find((board) => board.isDefault)
    if (!backlog) {
      return { code: 404, status: 'error' }
    }

    const board = await tryRequest(() =>
      client.GET('/api/epics/{id}', { params: { path: { id: Number(backlog.id) } }, signal }),
    )
    if (!board) {
      return { code: 0, status: 'error' }
    }
    if (isErrorResponse(board)) {
      return {
        code: board.response.status,
        status: 'error',
      }
    }
    if (board.data === undefined) {
      return { code: 0, status: 'error' }
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
