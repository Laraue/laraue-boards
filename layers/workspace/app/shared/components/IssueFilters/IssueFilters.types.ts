export type IssueFilterBoardStatus = 'Active' | 'Done' | 'New'

export type IssueFiltersValue = {
  assigneeIds?: string[]
  attributes: Record<string, string | string[]>
  epicStatuses?: IssueFilterBoardStatus[]
  spaceIds?: string[]
}

export type AttributeFilterValues = Record<string, string | string[]>
export type AttributeFilterInput =
  | { attributeId: string; from?: string; to?: string; type: 'date' }
  | { attributeId: string; from?: string; to?: string; type: 'dateTime' }
  | { attributeId: string; from?: string; to?: string; type: 'decimal' }
  | { attributeId: string; from?: string; to?: string; type: 'integer' }
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }
export type IssueFilterAttribute =
  | { id: string; options: Array<{ value: string }>; type: 'list' }
  | { id: string; type: 'date' }
  | { id: string; type: 'dateTime' }
  | { id: string; type: 'decimal' }
  | { id: string; type: 'integer' }
  | { id: string; type: 'text' }
