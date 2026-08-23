type DraftListValue = { key: number; name: string }

export type AttributeDraft = {
  color: string
  data:
    | { listValues: DraftListValue[]; type: 'list' }
    | { type: 'date' }
    | { type: 'dateTime' }
    | { type: 'decimal' }
    | { type: 'integer' }
    | { type: 'text' }
  name: string
}

export type CreateAttributeInput = {
  color: string
  data:
    | { listValues: string[]; type: 'list' }
    | { type: 'date' }
    | { type: 'dateTime' }
    | { type: 'decimal' }
    | { type: 'integer' }
    | { type: 'text' }
  name: string
}
