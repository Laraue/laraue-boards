import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { request } from '#infrastructure/api/request'
import { createGoogleSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/GoogleSignInButton/GoogleSignInButton.deps.impl'
import { createTelegramSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/TelegramSignInButton/TelegramSignInButton.deps.impl'
import { loadTelegramMiniAppData } from '#layers/workspace/app/shared/utils/loadTelegramMiniAppData'

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

  detectTelegramMiniApp: async () => Boolean(await loadTelegramMiniAppData()),
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
