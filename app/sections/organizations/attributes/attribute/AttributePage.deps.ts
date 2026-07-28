import type { ActionResult } from '#infrastructure/api/apiResult'
import type { QueryResult } from '#infrastructure/api/apiResult'

import type { UpdateAttributeInput } from './AttributePage.types'
import type { Attribute } from './AttributePage.types'

export type DeleteAttribute = (input: { id: string }) => Promise<ActionResult<true>>

export type UpdateAttribute = (input: UpdateAttributeInput) => Promise<ActionResult<true>>

export type ViewAttribute = (input: {
  attributeId: string
  signal?: AbortSignal
}) => Promise<QueryResult<Attribute>>

export type AttributePageDeps = {
  delete: DeleteAttribute
  update: UpdateAttribute
  view: ViewAttribute
}
