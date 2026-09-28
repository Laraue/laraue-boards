import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'

import type { ConnectedAccountsSectionDeps } from './components/ConnectedAccountsSection/ConnectedAccountsSection.deps'
import type { InterfaceSectionDeps } from './components/InterfaceSection/InterfaceSection.deps'
import type { ProfileSectionDeps } from './components/ProfileSection/ProfileSection.deps'
import type { UserAccountView } from './UserAccountPage.types'

export type ViewUserAccount = (input: {
  signal?: AbortSignal
}) => Promise<QueryResult<UserAccountView>>

export type Logout = () => Promise<ActionResult<true>>

export type UserAccountPageDeps = {
  connectedAccounts: ConnectedAccountsSectionDeps
  interface: InterfaceSectionDeps
  logout: Logout
  profile: ProfileSectionDeps
  view: ViewUserAccount
}
