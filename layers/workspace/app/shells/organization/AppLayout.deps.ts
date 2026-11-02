import type { IssueAttributeField } from '#layers/workspace/app/sections/issues/shared/components/IssueAttributeFields/IssueAttributeFields.types'
import type { TourStateDeps } from '#layers/workspace/app/shared/composables/useTour'
import type { FeedbackDialogDeps } from '#layers/workspace/app/shells/organization/components/FeedbackDialog/FeedbackDialog.deps'
import type { OrganizationSetupDeps } from '#layers/workspace/app/shells/organization/components/OrganizationSetup/OrganizationSetup.deps'

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
  // The setup window to show the owner until the organization is set up (BRD-293).
  setup?: {
    // The space sign-up created, to name; absent when the organization has no space.
    space?: { color: string; issueCount: number; key: string; name: string }
  }
  // The organization's issue attributes, for the pages that filter or fill them in.
  attributes: IssueAttributeField[]
  spaces: Array<{
    color: string
    key: string
    name: string
  }>
  user: { color: string; initials: string; name: string; tariffName: string }
}

/** The spaces and attributes the layout loaded once for the organization (BRD-301). Pages read
 * them instead of asking the API again; the pages that change them refresh the layout. */
export type OrganizationCatalog = Pick<AppLayoutData, 'attributes' | 'spaces'>

export type ReadOrganizationCatalog = () => OrganizationCatalog

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
  setup: OrganizationSetupDeps
  tour: TourStateDeps
  view: ViewAppLayout
}
