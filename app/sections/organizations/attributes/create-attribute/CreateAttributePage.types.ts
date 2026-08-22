type DraftListValue = { key: number; name: string }
type AttributeType = 'date' | 'dateTime' | 'decimal' | 'integer' | 'list' | 'text'

export type AttributeDraft = {
  color: string
  data:
    | { listValues: DraftListValue[]; type: 'list' }
    | { type: Exclude<AttributeType, 'list'> }
  name: string
}

export type CreateAttributeInput = {
  color: string
  data: { listValues: string[]; type: 'list' } | { type: Exclude<AttributeType, 'list'> }
  name: string
}
