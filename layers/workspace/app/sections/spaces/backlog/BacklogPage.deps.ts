import type { IssueAttributeField } from '#layers/workspace/app/sections/issues/shared/components/IssueAttributeFields/IssueAttributeFields.types'
import type { IssueListDeps } from '#layers/workspace/app/sections/issues/shared/components/IssueList/IssueList.deps'
import type { IssueListItem } from '#layers/workspace/app/sections/issues/shared/components/IssueList/IssueList.types'

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
