import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { mapRawIssueFilters } from '~/sections/issues/shared/api/issueAttributes'
import { createdAtDescending } from '~/sections/issues/shared/api/issueSorting'
import { findSpaceByKey } from '~/sections/spaces/shared/findSpaceByKey'

import type { ViewBacklog } from '../BacklogPage.deps'
import { mapIssue } from './mapIssue'

export const createViewBacklog =
  (client: ApiClient): ViewBacklog =>
  async ({ attributeQuery, page, search, signal, spaceKey }) => {
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
    if ('error' in spaces) {
      return { code: spaces.response.status, status: 'error' }
    }
    if ('error' in attributes) {
      return { code: attributes.response.status, status: 'error' }
    }
    const space = findSpaceByKey(spaces.data, spaceKey)
    if (!space) {
      return { code: 404, status: 'error' }
    }
    const attributeData = mapRawIssueFilters(attributeQuery, attributes.data)
    const boards = await tryRequest(() =>
      client.GET('/api/spaces/{id}/epics', {
        params: { path: { id: Number(space.id) } },
        signal,
      }),
    )
    if (!boards || 'error' in boards) {
      return { code: boards?.response.status ?? 0, status: 'error' }
    }
    const backlog = boards.data.find((board) => board.isDefault)
    if (!backlog) {
      return { code: 404, status: 'error' }
    }
    const issues = await tryRequest(() =>
      client.POST('/api/issues/search', {
        body: {
          epicIds: [backlog.id],
          filters: attributeData.filters,
          page: page - 1,
          perPage: 10,
          searchString: search || undefined,
          sorting: createdAtDescending,
        },
        signal,
      }),
    )
    if (!issues || 'error' in issues) {
      return { code: issues?.response.status ?? 0, status: 'error' }
    }
    return {
      data: {
        attributes: attributeData.attributes,
        backlogBoardId: String(backlog.id),
        color: space.color,
        hasNextPage: issues.data.hasNextPage,
        issues: issues.data.data.map(mapIssue),
        spaceKey,
        title: backlog.name,
      },
      status: 'success',
    }
  }
