import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'

import type { PermissionsPageData } from './PermissionsPage.types'

export type RegenerateJoinCode = () => Promise<ActionResult<string>>

export type ViewPermissions = (input: {
  signal?: AbortSignal
}) => Promise<QueryResult<PermissionsPageData>>

export type PermissionsPageDeps = {
  regenerateJoinCode: RegenerateJoinCode
  view: ViewPermissions
}
