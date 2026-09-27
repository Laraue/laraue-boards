import type { QueryResult } from '#infrastructure/api/apiResult'
import type { AppPreferences } from '~/composables/useAppPreferences'

import type { ConnectedAccountsSectionDeps } from './components/ConnectedAccountsSection/ConnectedAccountsSection.deps'
import type { UserAccountView } from './UserAccountPage.types'

export type ViewUserAccount = (input: {
  signal?: AbortSignal
}) => Promise<QueryResult<UserAccountView>>

export type UserAccountPageDeps = {
  connectedAccounts: ConnectedAccountsSectionDeps
  preferences: AppPreferences
  view: ViewUserAccount
}
