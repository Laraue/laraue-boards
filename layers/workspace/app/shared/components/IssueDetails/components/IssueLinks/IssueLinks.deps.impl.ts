import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { isApiError, request } from '#infrastructure/api/request'
import { assertNever } from '#layers/workspace/app/shared/utils/assertNever'

import type { IssueLinksDeps } from './IssueLinks.deps'
import type { IssueLinkRelation } from './IssueLinks.types'

const SUGGESTION_COUNT = 10

export const createIssueLinksDeps = (client: ApiClient): IssueLinksDeps => ({
  add: async ({ issueKey, otherIssueKey, relation }) => {
    try {
      await request(
        client.POST('/api/issues/{key}/links', {
          body: { otherIssueKey, relation: toApiIssueLinkRelation(relation) },
          params: { path: { key: issueKey } },
        }),
      )
    } catch (error) {
      // A mistyped key is the user's to fix in the form, not a failure to report.
      if (isApiError(error, 404)) {
        return { outcome: 'notFound' }
      }
      throw error
    }
    return { outcome: 'added' }
  },

  remove: async ({ issueKey, otherIssueKey }) => {
    await request(
      client.DELETE('/api/issues/{key}/links/{otherKey}', {
        params: { path: { key: issueKey, otherKey: otherIssueKey } },
      }),
    )
  },

  searchIssues: async ({ search, signal }) => {
    let result
    try {
      result = await request(
        client.POST('/api/issues/search', {
          body: { page: 0, perPage: SUGGESTION_COUNT, searchString: search },
          signal,
        }),
      )
    } catch (error) {
      if (isApiError(error)) {
        return { outcome: 'failed' }
      }
      throw error
    }
    return {
      issues: result.data.map((issue) => ({ issueKey: issue.key, title: issue.title })),
      outcome: 'found',
    }
  },
})

type ApiRelation = components['schemas']['IssueLinkRelation']

export const mapIssueLinkRelation = (relation: ApiRelation): IssueLinkRelation => {
  switch (relation) {
    case 'Blocks':
      return 'blocks'
    case 'BlockedBy':
      return 'blockedBy'
    case 'RelatesTo':
      return 'relatesTo'
    case 'Duplicates':
      return 'duplicates'
    case 'DuplicatedBy':
      return 'duplicatedBy'
    default:
      return assertNever(relation)
  }
}

export const toApiIssueLinkRelation = (relation: IssueLinkRelation): ApiRelation => {
  switch (relation) {
    case 'blocks':
      return 'Blocks'
    case 'blockedBy':
      return 'BlockedBy'
    case 'relatesTo':
      return 'RelatesTo'
    case 'duplicates':
      return 'Duplicates'
    case 'duplicatedBy':
      return 'DuplicatedBy'
    default:
      return assertNever(relation)
  }
}
