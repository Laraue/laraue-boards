export type Attribute = {
  color: string
  data:
    | { listValues: Array<{ id: string; name: string }>; type: 'list' }
    | { type: 'date' }
    | { type: 'dateTime' }
    | { type: 'decimal' }
    | { type: 'integer' }
    | { type: 'text' }
  id: string
  isEnabled: boolean
  name: string
  showOnCard: boolean
}

type DraftListValue = { id: null | string; key: number; name: string }

export type AttributeDraft = {
  color: string
  data:
    | { listValues: DraftListValue[]; type: 'list' }
    | { type: 'date' }
    | { type: 'dateTime' }
    | { type: 'decimal' }
    | { type: 'integer' }
    | { type: 'text' }
  id: string
  isEnabled: boolean
  name: string
  showOnCard: boolean
}

export type UpdateAttributeInput = {
  color: string
  data:
    | { listValues: Array<{ id: null | string; name: string }>; type: 'list' }
    | { type: 'date' }
    | { type: 'dateTime' }
    | { type: 'decimal' }
    | { type: 'integer' }
    | { type: 'text' }
  id: string
  // The organization's defaults for spaces and epics that don't have their own attribute settings.
  isEnabled: boolean
  name: string
  showOnCard: boolean
}

export type AttributePageDeps = {
  delete: (input: { id: string }) => Promise<void>
  update: (input: UpdateAttributeInput) => Promise<void>
  // Rejects with a 404 when the organization has no such attribute.
  view: (input: { attributeId: string; signal?: AbortSignal }) => Promise<Attribute>
}
