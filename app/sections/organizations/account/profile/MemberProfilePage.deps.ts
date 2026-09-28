import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'

import type { MemberProfile, UpdateMemberProfileInput } from './MemberProfilePage.types'

export type ViewMemberProfile = (input: {
  signal?: AbortSignal
}) => Promise<QueryResult<MemberProfile>>

export type UpdateMemberProfile = (input: UpdateMemberProfileInput) => Promise<ActionResult<true>>

export type MemberProfilePageDeps = {
  update: UpdateMemberProfile
  view: ViewMemberProfile
}
