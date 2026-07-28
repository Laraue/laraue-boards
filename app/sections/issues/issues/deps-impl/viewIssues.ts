import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { mapRawIssueFilters } from '~/sections/issues/shared/api/issueAttributes'
import { createdAtDescending } from '~/sections/issues/shared/api/issueSorting'

import type { ViewIssues } from '../IssuesPage.deps'
import { mapIssue } from './mapIssue'

export const createViewIssues =
  (client: ApiClient): ViewIssues =>
  async ({ attributeQuery, page, search, signal, spaceIds }) => {
    const attributes = await tryRequest(() =>
      client.GET('/api/organizations/attributes', { signal }),
    )
    if (!attributes || !('data' in attributes) || attributes.data === undefined) {
      return {
        code: attributes && 'error' in attributes ? attributes.response.status : 0,
        status: 'error',
      }
    }

    const attributeData = mapRawIssueFilters(attributeQuery, attributes.data)
    const responses = await tryRequest(() =>
      Promise.all([
        client.POST('/api/issues/search', {
          body: {
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
    if (!('data' in issues) || issues.data === undefined) {
      return { code: 'error' in issues ? issues.response.status : 0, status: 'error' }
    }
    if (!('data' in spaces) || spaces.data === undefined) {
      return { code: 'error' in spaces ? spaces.response.status : 0, status: 'error' }
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
