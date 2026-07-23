import type { components } from '#infrastructure/api/generated'

import type { BoardPageViewModel, SearchBoardIssuesResult } from '../BoardPage.types'

type Schemas = components['schemas']

export const mapIssueListItem = (issue: Schemas['IssueListDto']) => ({
  assigneeColor: issue.assigneeColor,
  assigneeInitial: issue.assigneeInitial ?? '?',
  assigneeName: issue.assignee,
  content: issue.content ?? '',
  issueKey: issue.key,
  time: issue.time,
})

export const mapBoardIssues = (
  columnIssues: Schemas['ColumnIssues'][],
): SearchBoardIssuesResult => ({
  columns: columnIssues.map((column) => ({
    hasNext: column.items.hasNext ?? false,
    id: String(column.statusId),
    issueCount: Number(column.items.totalCount ?? 0),
    issues: column.items.data.map(mapIssueListItem),
  })),
  issueCount: columnIssues.reduce((sum, column) => sum + Number(column.items.totalCount ?? 0), 0),
})

export const mapBoardPage = (
  boardId: string,
  board: Schemas['EpicDto'],
  columnIssues: Schemas['ColumnIssues'][],
  attributes: BoardPageViewModel['attributes'],
): BoardPageViewModel => {
  const issues = mapBoardIssues(columnIssues)
  const issuesByStatus = new Map(issues.columns.map((column) => [column.id, column]))

  return {
    attributes,
    canCreateIssues: board.canCreateIssues,
    canDelete: board.canDelete ?? false,
    canMoveIssues: board.canUpdateIssues,
    canUpdate: board.canUpdate ?? false,
    color: board.color ?? null,
    columns: (board.statuses ?? [])
      .toSorted((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
      .map((status) => {
        const column = issuesByStatus.get(String(status.id))
        return {
          color: status.color ?? null,
          hasNext: column?.hasNext ?? false,
          id: String(status.id),
          issueCount: column?.issueCount ?? 0,
          issues: column?.issues ?? [],
          title: status.name,
        }
      }),
    id: boardId,
    issueCount: issues.issueCount,
    title: board.name,
  }
}
