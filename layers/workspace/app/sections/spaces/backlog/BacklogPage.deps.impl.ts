import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { ApiError, request } from '#infrastructure/api/request'
import {
  mapIssueFilters,
  mapRawIssueFilters,
} from '#layers/workspace/app/sections/issues/shared/api/issueAttributes'
import { createdAtDescending } from '#layers/workspace/app/sections/issues/shared/api/issueSorting'
import { issueSourceField } from '#layers/workspace/app/sections/issues/shared/api/issueSource'
import { createIssueListDeps } from '#layers/workspace/app/sections/issues/shared/components/IssueList/IssueList.deps.impl'
import type { IssueListItem } from '#layers/workspace/app/sections/issues/shared/components/IssueList/IssueList.types'
import { COLORS } from '#layers/workspace/app/shared/constants/colors'
import type { ReadOrganizationCatalog } from '#layers/workspace/app/shells/organization/AppLayout.deps'

import type { BacklogPageDeps } from './BacklogPage.deps'

const PER_PAGE = 10

const mapIssue = (issue: components['schemas']['SearchIssueDto']): IssueListItem => ({
  assignee: issue.assignee,
  assigneeColor: issue.assigneeColor,
  assigneeId: issue.assigneeId,
  assigneeInitial: issue.assigneeInitial ?? '?',
  blocked: issue.isBlocked,
  boardColor: issue.epic.color,
  boardId: String(issue.epicId),
  boardName: issue.epic.name,
  canMove: issue.canEdit,
  issueKey: issue.key,
  ...issueSourceField(issue.createdVia, issue.createdByApiKeyName),
  spaceKey: issue.spaceKey,
  status: issue.status?.name ?? null,
  statusCategory: issue.status?.category,
  statusColor: issue.status?.color ?? COLORS.gray,
  statusId: String(issue.statusId),
  title: issue.title,
})

export const createBacklogPageDeps = (
  client: ApiClient,
  readCatalog: ReadOrganizationCatalog,
): BacklogPageDeps => ({
  issueList: createIssueListDeps(client),

  // The page counts from 1, the API from 0.
  search: async ({ backlogBoardId, filters, page, search }) => {
    const issues = await request(
      client.POST('/api/issues/search', {
        body: {
          epicIds: [Number(backlogBoardId)],
          filters: mapIssueFilters(filters),
          page: page - 1,
          perPage: PER_PAGE,
          searchString: search || undefined,
          sorting: createdAtDescending,
        },
      }),
    )
    return { hasNextPage: issues.hasNextPage, issues: issues.data.map(mapIssue) }
  },

  view: async ({ attributeQuery, page, search, signal, spaceKey }) => {
    const { attributes, spaces } = readCatalog()
    const boards = await request(
      client.GET('/api/spaces/{key}/epics', { params: { path: { key: spaceKey } }, signal }),
    )
    const space = spaces.find((item) => item.key === spaceKey)
    const backlog = boards.find((board) => board.isDefault)
    if (!space || !backlog) {
      throw new ApiError(404)
    }
    const issues = await request(
      client.POST('/api/issues/search', {
        body: {
          epicIds: [backlog.id],
          filters: mapRawIssueFilters(attributeQuery, attributes),
          page: page - 1,
          perPage: PER_PAGE,
          searchString: search || undefined,
          sorting: createdAtDescending,
        },
        signal,
      }),
    )
    return {
      attributes,
      backlogBoardId: String(backlog.id),
      hasNextPage: issues.hasNextPage,
      issues: issues.data.map(mapIssue),
      spaceColor: space.color,
      spaceName: space.name,
      title: backlog.name,
    }
  },
})
