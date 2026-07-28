import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'

export type CreateBacklogIssuePageData = {
  attributes: IssueAttributeField[]
  boardId: string
  boardName: string
  spaceKey: string
}
