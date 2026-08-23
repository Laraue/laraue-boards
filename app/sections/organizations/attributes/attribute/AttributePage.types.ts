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
  name: string
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
  name: string
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
  name: string
}
