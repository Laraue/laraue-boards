import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'
import type { IssueListItem } from '~/components/issue-list/IssueList.types'

export type IssuesPageData = {
  attributes: IssueAttributeField[]
  hasNextPage: boolean
  issues: IssueListItem[]
  spaces: Array<{ label: string; value: string }>
}

export type IssuesFilter =
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }
  | {
      attributeId: string
      from?: string
      to?: string
      type: 'date' | 'dateTime' | 'decimal' | 'integer'
    }

export type SearchIssuesResult = {
  hasNextPage: boolean
  issues: IssueListItem[]
}
