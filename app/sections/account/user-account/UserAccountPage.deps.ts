import type { ConnectedAccountsSectionDeps } from './components/ConnectedAccountsSection/ConnectedAccountsSection.deps'
import type { InterfaceSectionDeps } from './components/InterfaceSection/InterfaceSection.deps'
import type { ProfileSectionDeps } from './components/ProfileSection/ProfileSection.deps'

// The initials come from the user's global profile (null when it couldn't be read); there's no
// global color - a person is shown per organization.
export type UserAccountView = { initials: null | string }

export type UserAccountPageDeps = {
  connectedAccounts: ConnectedAccountsSectionDeps
  interface: InterfaceSectionDeps
  logout: () => Promise<void>
  profile: ProfileSectionDeps
  view: (input: { signal?: AbortSignal }) => Promise<UserAccountView>
}
