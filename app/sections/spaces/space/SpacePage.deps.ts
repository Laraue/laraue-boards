import type { QueryResult } from '#infrastructure/api/apiResult'

import type { SpacePageData } from './SpacePage.types'

export type ViewSpace = (input: {
  signal?: AbortSignal
  spaceKey: string
}) => Promise<QueryResult<SpacePageData>>

export type SpacePageDeps = {
  view: ViewSpace
}
