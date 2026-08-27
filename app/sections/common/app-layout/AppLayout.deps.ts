import type { ActionResult } from '#infrastructure/api/apiResult'
import type { TourStateDeps } from '~/composables/useTour'

import type { AppLayoutData } from './AppLayout.types'

export type Logout = () => Promise<ActionResult<true>>

export type AppLayoutProblem =
  | { code: number; kind: 'load-failed' }
  | { kind: 'no-access' }
  | { kind: 'selecting-organization' }
  | { kind: 'signed-out' }
  | { kind: 'unknown-organization' }

export type RoutableProblem = Exclude<AppLayoutProblem, { kind: 'selecting-organization' }>

export type AppLayoutResult =
  | { data: AppLayoutData; status: 'success' }
  | { problem: AppLayoutProblem; status: 'problem' }

export type ViewAppLayout = (input: {
  organizationKey: string
  signal?: AbortSignal
}) => Promise<AppLayoutResult>

export type AppLayoutDeps = {
  logout: Logout
  tour: TourStateDeps
  view: ViewAppLayout
}
