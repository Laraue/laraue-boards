import type { TourStateDeps } from '#layers/workspace/app/shared/composables/useTour'
import type { FeedbackDialogDeps } from '#layers/workspace/app/shells/organization/components/FeedbackDialog/FeedbackDialog.deps'

export type AppLayoutData = {
  organization: {
    canCreateSpaces: boolean
    canManage: boolean
    canManageAttributes: boolean
    canMassMove: boolean
    canUpdate: boolean
    canViewBilling: boolean
    color: string
    id: string
    initial: string
    name: string
  }
  spaces: Array<{
    color: string
    key: string
    name: string
  }>
  user: { color: string; initials: string; name: string; tariffName: string }
}

export type AppLayoutProblem =
  | { code: number; kind: 'load-failed' }
  | { kind: 'no-access' }
  | { kind: 'selecting-organization' }
  | { kind: 'signed-out' }
  | { kind: 'unknown-organization' }

// The route wires useSignInRedirect into its API client; the layout waits while it redirects.
export type RoutableProblem = Exclude<
  AppLayoutProblem,
  { kind: 'selecting-organization' } | { kind: 'signed-out' }
>

export type AppLayoutResult =
  | { data: AppLayoutData; status: 'success' }
  | { problem: AppLayoutProblem; status: 'problem' }

export type ViewAppLayout = (input: {
  organizationKey: string
  signal?: AbortSignal
}) => Promise<AppLayoutResult>

export type AppLayoutDeps = {
  feedback: FeedbackDialogDeps
  logout: () => Promise<void>
  tour: TourStateDeps
  view: ViewAppLayout
}
