import type { components } from '#infrastructure/api/generated'

export type IssueListItem = {
  assignee: string
  assigneeColor: string
  assigneeId?: string
  assigneeInitial: string
  boardColor: string
  boardId?: string
  boardName: string
  // An issue the user can read blocks this one and isn't completed yet.
  blocked: boolean
  canMove: boolean
  issueKey: string
  spaceColor?: string
  spaceKey?: string
  spaceName?: string
  status: null | string
  statusCategory?: components['schemas']['StatusCategory']
  statusColor: string
  statusId?: string
  title: string
}
