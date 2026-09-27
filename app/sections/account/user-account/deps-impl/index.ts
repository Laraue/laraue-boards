import type { ApiClient } from '#infrastructure/api/client'
import type { AppPreferences } from '~/composables/useAppPreferences'

import { createConnectedAccountsSectionDeps } from '../components/ConnectedAccountsSection/deps-impl'
import type { UserAccountPageDeps } from '../UserAccountPage.deps'
import { createViewUserAccount } from './viewUserAccount'

export const createUserAccountPageDeps = (
  client: ApiClient,
  preferences: AppPreferences,
): UserAccountPageDeps => ({
  connectedAccounts: createConnectedAccountsSectionDeps(client),
  preferences,
  view: createViewUserAccount(client),
})
