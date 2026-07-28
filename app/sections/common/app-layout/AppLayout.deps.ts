import type { ActionResult } from '#infrastructure/api/apiResult'
import type { QueryResult } from '#infrastructure/api/apiResult'

import type { AppLayoutData } from './AppLayout.types'

export type Logout = () => Promise<ActionResult<true>>

export type ViewAppLayout = (input: {
  organizationKey: string
  signal?: AbortSignal
}) => Promise<QueryResult<AppLayoutData>>

export type AppLayoutDeps = {
  logout: Logout
  view: ViewAppLayout
}
