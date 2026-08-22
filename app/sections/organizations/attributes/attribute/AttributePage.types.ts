type AttributeType = 'date' | 'dateTime' | 'decimal' | 'integer' | 'list' | 'text'

export type Attribute = {
  color: string
  data:
    | { listValues: Array<{ id: string; name: string }>; type: 'list' }
    | { type: Exclude<AttributeType, 'list'> }
  id: string
  name: string
}

type DraftListValue = { id: null | string; key: number; name: string }

export type AttributeDraft = {
  color: string
  data:
    | { listValues: DraftListValue[]; type: 'list' }
    | { type: Exclude<AttributeType, 'list'> }
  id: string
  name: string
}

export type UpdateAttributeInput = {
  color: string
  data:
    | { listValues: Array<{ id: null | string; name: string }>; type: 'list' }
    | { type: Exclude<AttributeType, 'list'> }
  id: string
  name: string
}
