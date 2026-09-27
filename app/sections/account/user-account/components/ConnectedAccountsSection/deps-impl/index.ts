import type { ApiClient } from '#infrastructure/api/client'
import { createGoogleSignInButtonDeps } from '~/components/google-sign-in-button/deps-impl'
import { createTelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/deps-impl'

import type { ConnectedAccountsSectionDeps } from '../ConnectedAccountsSection.deps'
import { createConnectGoogle } from './connectGoogle'
import { createConnectTelegram } from './connectTelegram'
import { createViewConnectedAccounts } from './viewConnectedAccounts'

export const createConnectedAccountsSectionDeps = (
  client: ApiClient,
): ConnectedAccountsSectionDeps => ({
  connectGoogle: createConnectGoogle(client),
  connectTelegram: createConnectTelegram(client),
  googleSignInButton: createGoogleSignInButtonDeps(),
  telegramSignInButton: createTelegramSignInButtonDeps(),
  view: createViewConnectedAccounts(client),
})
