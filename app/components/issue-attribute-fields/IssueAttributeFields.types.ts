export type IssueAttributeValueInput =
  | { attributeId: string; type: 'date'; value: string }
  | { attributeId: string; type: 'dateTime'; value: string }
  | { attributeId: string; type: 'decimal'; value: string }
  | { attributeId: string; type: 'integer'; value: string }
  | { attributeId: string; type: 'list'; valueId: string }
  | { attributeId: string; type: 'text'; value: string }

export type IssueAttributeField =
  | { color: string; id: string; name: string; type: 'date' }
  | { color: string; id: string; name: string; type: 'dateTime' }
  | { color: string; id: string; name: string; type: 'decimal' }
  | { color: string; id: string; name: string; type: 'integer' }
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }
