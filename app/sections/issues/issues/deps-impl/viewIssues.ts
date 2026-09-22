import type { ApiClient } from '#infrastructure/api/client'
import { isErrorResponse, tryRequest } from '#infrastructure/api/tryRequest'
import { mapRawIssueFilters } from '~/sections/issues/shared/api/issueAttributes'
import { createdAtDescending } from '~/sections/issues/shared/api/issueSorting'

import type { ViewIssues } from '../IssuesPage.deps'
import { mapIssue } from './mapIssue'

export const createViewIssues =
  (client: ApiClient): ViewIssues =>
  async ({ attributeQuery, epicStatuses, page, search, signal, spaceIds }) => {
    const attributes = await tryRequest(() =>
      client.GET('/api/organizations/attributes', { signal }),
    )
    if (!attributes) {
      return {
        code: 0,
        status: 'error',
      }
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

    const attributeData = mapRawIssueFilters(attributeQuery, attributes.data)
    const responses = await tryRequest(() =>
      Promise.all([
        client.POST('/api/issues/search', {
          body: {
            epicStatuses: epicStatuses.length ? epicStatuses : undefined,
            filters: attributeData.filters,
            page: page - 1,
            perPage: 10,
            searchString: search || undefined,
            sorting: createdAtDescending,
            spaceKeys: spaceIds.length ? spaceIds : undefined,
          },
          signal,
        }),
        client.GET('/api/spaces', { signal }),
      ]),
    )
    if (!responses) {
      return { code: 0, status: 'error' }
    }

    const [issues, spaces] = responses
    if (isErrorResponse(issues)) {
      return { code: issues.response.status, status: 'error' }
    }
    if (isErrorResponse(spaces)) {
      return { code: spaces.response.status, status: 'error' }
    }
    if (issues.data === undefined || spaces.data === undefined) {
      return { code: 0, status: 'error' }
    }

    return {
      data: {
        attributes: attributeData.attributes,
        hasNextPage: issues.data.hasNextPage,
        issues: issues.data.data.map(mapIssue),
        spaces: spaces.data.map((space) => ({ label: space.name, value: space.key })),
      },
      status: 'success',
    }
  }
