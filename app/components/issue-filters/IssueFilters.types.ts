export type IssueFilterBoardStatus = 'Active' | 'Done' | 'New'

export type IssueFiltersValue = {
  attributes: Record<string, string | string[]>
  epicStatuses?: IssueFilterBoardStatus[]
  spaceIds?: string[]
}
