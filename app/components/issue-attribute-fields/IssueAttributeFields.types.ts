export type IssueAttributeType = 'date' | 'dateTime' | 'decimal' | 'integer' | 'list' | 'text'

export type IssueAttributeValueInput =
  | { attributeId: string; type: 'list'; valueId: string }
  | { attributeId: string; type: Exclude<IssueAttributeType, 'list'>; value: string }

export type IssueAttributeField =
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }
  | {
      color: string
      id: string
      name: string
      type: Exclude<IssueAttributeType, 'list'>
    }
