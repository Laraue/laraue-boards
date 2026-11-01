import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { ApiError, request } from '#infrastructure/api/request'
import { createIssuePageDeps } from '#layers/workspace/app/sections/issues/issue/IssuePage.deps.impl'
import { mapAgentRunState } from '#layers/workspace/app/sections/issues/shared/api/agentRun'
import {
  mapIssueFilters,
  mapRawIssueFilters,
} from '#layers/workspace/app/sections/issues/shared/api/issueAttributes'
import { issueSourceField } from '#layers/workspace/app/sections/issues/shared/api/issueSource'
import { DEFAULT_COLOR } from '#layers/workspace/app/shared/constants/colors'
import type { ReadOrganizationCatalog } from '#layers/workspace/app/shells/organization/AppLayout.deps'

import type { BoardPageDeps, SearchBoardIssuesResult } from './BoardPage.deps'

type Schemas = components['schemas']

const mapIssueListItem = (issue: Schemas['IssueListDto']) => ({
  ...(issue.latestAgentRun ? { agentRunState: mapAgentRunState(issue.latestAgentRun.state) } : {}),
  ...issueSourceField(issue.createdVia, issue.createdByApiKeyName),
  assigneeColor: issue.assigneeColor,
  assigneeInitial: issue.assigneeInitial ?? '?',
  assigneeName: issue.assignee,
  blocked: issue.isBlocked,
  issueKey: issue.key,
  time: issue.time,
  title: issue.title,
})

const mapBoardIssues = (columnIssues: Schemas['ColumnIssues'][]): SearchBoardIssuesResult => ({
  columns: columnIssues.map((column) => ({
    hasNext: column.items.hasNext,
    id: String(column.statusId),
    issueCount: column.items.totalCount,
    issues: column.items.data.map(mapIssueListItem),
  })),
  issueCount: columnIssues.reduce((sum, column) => sum + column.items.totalCount, 0),
})

const sortByOrder = <Item extends { sortOrder: number }>(items: Item[]) =>
  items.toSorted((left, right) => left.sortOrder - right.sortOrder)

export const createBoardPageDeps = (
  client: ApiClient,
  readCatalog: ReadOrganizationCatalog,
): BoardPageDeps => ({
  issueDialog: createIssuePageDeps(client),

  loadMoreBoardIssues: async ({ filters, offset, search, statusId, take }) => {
    const page = await request(
      client.POST('/api/issues/by-status/{statusId}/search', {
        body: {
          filters: mapIssueFilters(filters),
          searchString: search || undefined,
          skip: offset,
          take,
        },
        params: { path: { statusId: Number(statusId) } },
      }),
    )
    return { hasNext: page.hasNext, issues: page.data.map(mapIssueListItem) }
  },

  // Dropped into another column changes the status first, then the order next to `target`.
  moveBoardIssue: async ({ issueKey, statusId, target, updateStatus }) => {
    if (updateStatus) {
      if (!statusId) {
        throw new ApiError(400)
      }
      await request(
        client.POST('/api/issues/status', {
          body: { issueKeys: [issueKey], statusId: Number(statusId) },
        }),
      )
    }
    if (target) {
      await request(
        client.POST('/api/issues/order', {
          body: { issueKeys: [issueKey], targetKey: target.issueKey, targetType: target.position },
        }),
      )
    }
  },

  // The backlog is the space's default board; the issue goes to its first status.
  moveIssueToBacklog: async ({ boardId, issueKey, spaceKey }) => {
    const boards = await request(
      client.GET('/api/spaces/{key}/epics', { params: { path: { key: spaceKey } } }),
    )
    const current = boards.find((board) => String(board.id) === boardId)
    const backlog = boards.find((board) => board.isDefault)
    if (!current || !backlog) {
      throw new ApiError(404)
    }
    if (current.id === backlog.id) {
      throw new ApiError(409)
    }
    const backlogBoard = await request(
      client.GET('/api/epics/{id}', { params: { path: { id: Number(backlog.id) } } }),
    )
    const [status] = sortByOrder(backlogBoard.statuses)
    if (!status) {
      throw new ApiError(500)
    }
    await request(
      client.POST('/api/issues/status', {
        body: { issueKeys: [issueKey], statusId: status.id },
      }),
    )
  },

  searchBoardIssues: async ({ boardId, filters, search, take }) =>
    mapBoardIssues(
      await request(
        client.POST('/api/issues/board', {
          body: {
            epicId: Number(boardId),
            filters: mapIssueFilters(filters),
            searchString: search || undefined,
            take,
          },
        }),
      ),
    ),

  // The attributes and the space's name and color come from the layout.
  view: async ({ attributeQuery, boardId, search, signal, spaceKey }) => {
    const { attributes, spaces } = readCatalog()
    const [board, columnIssues] = await Promise.all([
      request(client.GET('/api/epics/{id}', { params: { path: { id: Number(boardId) } }, signal })),
      request(
        client.POST('/api/issues/board', {
          body: {
            epicId: Number(boardId),
            filters: mapRawIssueFilters(attributeQuery, attributes),
            searchString: search || undefined,
            take: 25,
          },
          signal,
        }),
      ),
    ])
    const issues = mapBoardIssues(columnIssues)
    const issuesByStatus = new Map(issues.columns.map((column) => [column.id, column]))
    const space = spaces.find((item) => item.key === spaceKey)
    return {
      attributes,
      canCreateIssues: board.canCreateIssues,
      canDelete: board.canDelete,
      canMoveIssues: board.canUpdateIssues,
      canUpdate: board.canUpdate,
      color: board.color,
      columns: sortByOrder(board.statuses).map((status) => {
        const column = issuesByStatus.get(String(status.id))
        return {
          category: status.category,
          color: status.color,
          hasNext: column?.hasNext ?? false,
          id: String(status.id),
          issueCount: column?.issueCount ?? 0,
          issues: column?.issues ?? [],
          title: status.name,
        }
      }),
      id: boardId,
      issueCount: issues.issueCount,
      spaceColor: space?.color ?? DEFAULT_COLOR,
      spaceName: space?.name ?? spaceKey,
      status: board.status,
      title: board.name,
    }
  },
})
