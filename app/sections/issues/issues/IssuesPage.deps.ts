import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'
import type { IssueListDeps } from '~/components/issue-list/IssueList.deps'
import type { IssueListItem } from '~/components/issue-list/IssueList.types'

export const issueBoardStatuses = ['New', 'Active', 'Done'] as const
export type IssueBoardStatus = (typeof issueBoardStatuses)[number]

export type IssuesPageData = {
  attributes: IssueAttributeField[]
  hasNextPage: boolean
  issues: IssueListItem[]
  spaces: Array<{ label: string; value: string }>
}

export type IssuesFilter =
  | { attributeId: string; from?: string; to?: string; type: 'date' }
  | { attributeId: string; from?: string; to?: string; type: 'dateTime' }
  | { attributeId: string; from?: string; to?: string; type: 'decimal' }
  | { attributeId: string; from?: string; to?: string; type: 'integer' }
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }

export type SearchIssuesResult = {
  hasNextPage: boolean
  issues: IssueListItem[]
}

type IssuesRequest = {
  epicStatuses: IssueBoardStatus[]
  page: number
  search: string
  spaceIds: string[]
}

export type IssuesPageDeps = {
  issueList: IssueListDeps
  searchIssues: (input: IssuesRequest & { filters: IssuesFilter[] }) => Promise<SearchIssuesResult>
  view: (
    input: IssuesRequest & { attributeQuery: Record<string, string[]>; signal?: AbortSignal },
  ) => Promise<IssuesPageData>
}
