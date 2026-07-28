import type { QueryResult } from '#infrastructure/api/apiResult'

import type { PermissionsPageMember } from './PermissionsPage.types'

export type ViewPermissions = (input: {
  signal?: AbortSignal
}) => Promise<QueryResult<PermissionsPageMember[]>>

export type PermissionsPageDeps = {
  view: ViewPermissions
}
