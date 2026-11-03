import type { components } from '#infrastructure/api/generated'
import type { IssueCardAttribute } from '#layers/workspace/app/sections/issues/shared/components/IssueCardAttributes/IssueCardAttributes.types'
import type { IssueSource } from '#layers/workspace/app/sections/issues/shared/components/IssueSourceIcon/IssueSourceIcon.types'

export type IssueListItem = {
  assignee: string
  // The values the issue's board shows on cards; absent where the list doesn't show them.
  assigneeColor: string
  assigneeId?: string
  assigneeInitial: string
  attributes?: IssueCardAttribute[]
  boardColor: string
  boardId?: string
  boardName: string
  // An issue the user can read blocks this one and isn't completed yet.
  blocked: boolean
  canMove: boolean
  issueKey: string
  // How the issue was created; absent when the API sends none.
  source?: IssueSource
  spaceColor?: string
  spaceKey?: string
  spaceName?: string
  status: null | string
  statusCategory?: components['schemas']['StatusCategory']
  statusColor: string
  statusId?: string
  title: string
}
