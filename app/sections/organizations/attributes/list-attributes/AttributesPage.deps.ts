import type { QueryResult } from '#infrastructure/api/apiResult'

import type { AttributeListItem } from './AttributesPage.types'

export type ViewAttributes = (input: {
  signal?: AbortSignal
}) => Promise<QueryResult<AttributeListItem[]>>

export type AttributesPageDeps = {
  view: ViewAttributes
}
