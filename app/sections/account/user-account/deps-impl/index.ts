import type { ApiClient } from '#infrastructure/api/client'
import type { AppPreferences } from '~/composables/useAppPreferences'
import { createLogout } from '~/sections/common/app-layout/deps-impl/logout'

import { createConnectedAccountsSectionDeps } from '../components/ConnectedAccountsSection/deps-impl'
import { createProfileSectionDeps } from '../components/ProfileSection/deps-impl'
import type { UserAccountPageDeps } from '../UserAccountPage.deps'
import { createViewUserAccount } from './viewUserAccount'

export const createUserAccountPageDeps = (
  client: ApiClient,
  preferences: AppPreferences,
): UserAccountPageDeps => ({
  connectedAccounts: createConnectedAccountsSectionDeps(client),
  interface: preferences,
  logout: createLogout(client),
  profile: createProfileSectionDeps(client),
  view: createViewUserAccount(client),
})
