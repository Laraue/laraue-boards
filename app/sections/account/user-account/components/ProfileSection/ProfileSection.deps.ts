import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'

import type { GlobalProfile, UpdateGlobalProfileInput } from './ProfileSection.types'

export type ViewGlobalProfile = (input: {
  signal?: AbortSignal
}) => Promise<QueryResult<GlobalProfile>>

export type UpdateGlobalProfile = (
  input: UpdateGlobalProfileInput,
) => Promise<ActionResult<GlobalProfile>>

export type ProfileSectionDeps = {
  update: UpdateGlobalProfile
  view: ViewGlobalProfile
}
