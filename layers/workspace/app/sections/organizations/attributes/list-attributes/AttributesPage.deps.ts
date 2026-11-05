export type AttributeListItem = {
  color: string
  id: string
  // The organization's default: off means spaces and epics following its settings don't use it.
  isEnabled: boolean
  name: string
  type: 'date' | 'dateTime' | 'decimal' | 'integer' | 'list' | 'text'
}

export type AttributesPageDeps = {
  reorder: (input: { attributeIds: string[] }) => Promise<void>
  view: (input: { signal?: AbortSignal }) => Promise<AttributeListItem[]>
}
