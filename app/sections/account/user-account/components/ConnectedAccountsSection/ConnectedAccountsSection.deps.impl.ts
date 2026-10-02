import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { request } from '#infrastructure/api/request'
import { createGoogleSignInButtonDeps } from '~/components/google-sign-in-button/deps-impl'
import { createTelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/deps-impl'

import type { ConnectedAccountsSectionDeps, ConnectOutcome } from './ConnectedAccountsSection.deps'

const OUTCOMES: Record<components['schemas']['AccountLinkOutcome'], ConnectOutcome> = {
  Linked: 'linked',
  OwnerHasData: 'owner-has-data',
  OwnerUsedByAnotherService: 'owner-used-by-another-service',
  UserHasOtherAccount: 'user-has-other-account',
}

export const createConnectedAccountsSectionDeps = (
  client: ApiClient,
): ConnectedAccountsSectionDeps => ({
  connectGoogle: async ({ code }) => {
    const { outcome } = await request(
      client.POST('/api/user/connected-accounts/google', { body: { code } }),
    )
    return OUTCOMES[outcome]
  },

  connectTelegram: async (input) => {
    const { outcome } = await request(
      client.POST('/api/user/connected-accounts/telegram', { body: input }),
    )
    return OUTCOMES[outcome]
  },

  googleSignInButton: createGoogleSignInButtonDeps(),
  telegramSignInButton: createTelegramSignInButtonDeps(),

  view: async ({ signal }) => {
    const user = await request(client.GET('/api/user', { signal }))
    return {
      google: user.hasGoogleAccount ?? false,
      telegram: user.telegramId !== null && user.telegramId !== undefined,
    }
  },
})
