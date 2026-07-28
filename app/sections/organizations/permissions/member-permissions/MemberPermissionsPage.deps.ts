import type { ActionResult } from '#infrastructure/api/apiResult'
import type { QueryResult } from '#infrastructure/api/apiResult'

import type { MemberPermissions } from './MemberPermissionsPage.types'
import type { MemberPermissionsPageData } from './MemberPermissionsPage.types'

export type UpdateMemberPermissions = (input: {
  memberId: string
  permissions: MemberPermissions
}) => Promise<ActionResult<true>>

export type ViewMemberPermissions = (input: {
  memberId: string
  signal?: AbortSignal
}) => Promise<QueryResult<MemberPermissionsPageData>>

export type MemberPermissionsPageDeps = {
  update: UpdateMemberPermissions
  view: ViewMemberPermissions
}
