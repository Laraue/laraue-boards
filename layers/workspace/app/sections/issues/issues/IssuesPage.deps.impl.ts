import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { request } from '#infrastructure/api/request'
import {
  mapIssueFilters,
  mapRawIssueFilters,
} from '#layers/workspace/app/sections/issues/shared/api/issueAttributes'
import { createdAtDescending } from '#layers/workspace/app/sections/issues/shared/api/issueSorting'
import { issueSourceField } from '#layers/workspace/app/sections/issues/shared/api/issueSource'
import { createIssueListDeps } from '#layers/workspace/app/sections/issues/shared/components/IssueList/IssueList.deps.impl'
import type { IssueListItem } from '#layers/workspace/app/sections/issues/shared/components/IssueList/IssueList.types'
import { COLORS } from '#layers/workspace/app/shared/constants/colors'

import type { IssueBoardStatus, IssuesPageDeps } from './IssuesPage.deps'

type Schemas = components['schemas']

const mapIssue = (issue: Schemas['SearchIssueDto']): IssueListItem => ({
  assignee: issue.assignee,
  assigneeColor: issue.assigneeColor,
  assigneeId: issue.assigneeId,
  assigneeInitial: issue.assigneeInitial ?? '?',
  blocked: issue.isBlocked ?? false,
  boardColor: issue.epic.color,
  boardId: String(issue.epicId),
  boardName: issue.epic.name,
  canMove: issue.canEdit,
  issueKey: issue.key,
  ...issueSourceField(issue.createdVia, issue.createdByApiKeyName),
  spaceColor: issue.space.color,
  spaceKey: issue.spaceKey,
  spaceName: issue.space.name,
  status: issue.status?.name ?? null,
  statusCategory: issue.status?.category,
  statusColor: issue.status?.color ?? COLORS.gray,
  statusId: String(issue.statusId),
  title: issue.title,
})

// The page counts from 1, the API from 0; empty lists and search mean "no filter".
const searchBody = (input: {
  epicStatuses: IssueBoardStatus[]
  filters: Schemas['SearchRequest']['filters']
  page: number
  search: string
  spaceIds: string[]
}): Schemas['SearchRequest'] => ({
  epicStatuses: input.epicStatuses.length ? input.epicStatuses : undefined,
  filters: input.filters,
  page: input.page - 1,
  perPage: 20,
  searchString: input.search || undefined,
  sorting: createdAtDescending,
  spaceKeys: input.spaceIds.length ? input.spaceIds : undefined,
})

export const createIssuesPageDeps = (client: ApiClient): IssuesPageDeps => ({
  issueList: createIssueListDeps(client),

  searchIssues: async (input) => {
    const issues = await request(
      client.POST('/api/issues/search', {
        body: searchBody({ ...input, filters: mapIssueFilters(input.filters) }),
      }),
    )
    return { hasNextPage: issues.hasNextPage, issues: issues.data.map(mapIssue) }
  },

  // The attribute filters in the address need the attributes before the search can run.
  view: async ({ attributeQuery, signal, ...input }) => {
    const [attributes, spaces] = await Promise.all([
      request(client.GET('/api/organizations/attributes', { signal })),
      request(client.GET('/api/spaces', { signal })),
    ])
    const attributeData = mapRawIssueFilters(attributeQuery, attributes)
    const issues = await request(
      client.POST('/api/issues/search', {
        body: searchBody({ ...input, filters: attributeData.filters }),
        signal,
      }),
    )
    return {
      attributes: attributeData.attributes,
      hasNextPage: issues.hasNextPage,
      issues: issues.data.map(mapIssue),
      spaces: spaces.map((space) => ({ label: space.name, value: space.key })),
    }
  },
})
