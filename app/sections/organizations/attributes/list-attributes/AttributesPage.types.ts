export type AttributeListItem =
  | { color: string; id: string; name: string; type: 'date' }
  | { color: string; id: string; name: string; type: 'dateTime' }
  | { color: string; id: string; name: string; type: 'decimal' }
  | { color: string; id: string; name: string; type: 'integer' }
  | { color: string; id: string; name: string; type: 'list' }
  | { color: string; id: string; name: string; type: 'text' }
