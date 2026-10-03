import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'
import type { IssueListDeps } from '~/components/issue-list/IssueList.deps'
import type { IssueListItem } from '~/components/issue-list/IssueList.types'

export type BacklogPageData = {
  attributes: IssueAttributeField[]
  backlogBoardId: string
  hasNextPage: boolean
  issues: IssueListItem[]
  // The space's own name, for the path to it.
  spaceColor: string
  spaceName: string
  title: string
}

export type BacklogFilter =
  | { attributeId: string; from?: string; to?: string; type: 'date' }
  | { attributeId: string; from?: string; to?: string; type: 'dateTime' }
  | { attributeId: string; from?: string; to?: string; type: 'decimal' }
  | { attributeId: string; from?: string; to?: string; type: 'integer' }
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }

export type SearchBacklogResult = {
  hasNextPage: boolean
  issues: IssueListItem[]
}

export type BacklogPageDeps = {
  issueList: IssueListDeps
  search: (input: {
    backlogBoardId: string
    filters: BacklogFilter[]
    page: number
    search: string
  }) => Promise<SearchBacklogResult>
  view: (input: {
    attributeQuery: Record<string, string[]>
    page: number
    search: string
    signal?: AbortSignal
    spaceKey: string
  }) => Promise<BacklogPageData>
}
