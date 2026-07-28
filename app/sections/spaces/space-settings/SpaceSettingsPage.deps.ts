import type { ActionResult } from '#infrastructure/api/apiResult'
import type { QueryResult } from '#infrastructure/api/apiResult'

import type { UpdateSpaceInput } from './SpaceSettingsPage.types'
import type { SpaceSettingsPageData } from './SpaceSettingsPage.types'

export type RemoveSpace = (input: { spaceId: string }) => Promise<ActionResult<true>>

export type UpdateSpace = (input: UpdateSpaceInput) => Promise<ActionResult<true>>

export type ViewSpaceSettings = (input: {
  signal?: AbortSignal
  spaceKey: string
}) => Promise<QueryResult<SpaceSettingsPageData>>

export type SpaceSettingsPageDeps = {
  remove: RemoveSpace
  update: UpdateSpace
  view: ViewSpaceSettings
}
