import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'

export type CreateBoardIssuePageData = {
  attributes: IssueAttributeField[]
  boardName: string
  spaceKey: string
}
