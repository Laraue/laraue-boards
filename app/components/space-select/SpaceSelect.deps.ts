import type { QueryResult } from '#infrastructure/api/apiResult'

import type { SpaceSelectOption } from './SpaceSelect.types'

export type LoadSpaces = (input: {
  organizationId?: string
  signal?: AbortSignal
}) => Promise<QueryResult<SpaceSelectOption[]>>

export type SpaceSelectDeps = {
  loadSpaces: LoadSpaces
}
