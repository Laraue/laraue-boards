import type { ApiClient } from '#infrastructure/api/client'
import { createGoogleSignInButtonDeps } from '~/components/google-sign-in-button/deps-impl'
import { createTelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/deps-impl'

import type { ConnectedAccountsPageDeps } from '../ConnectedAccountsPage.deps'
import { createConnectGoogle } from './connectGoogle'
import { createConnectTelegram } from './connectTelegram'
import { createViewConnectedAccounts } from './viewConnectedAccounts'

export const createConnectedAccountsPageDeps = (client: ApiClient): ConnectedAccountsPageDeps => ({
  connectGoogle: createConnectGoogle(client),
  connectTelegram: createConnectTelegram(client),
  googleSignInButton: createGoogleSignInButtonDeps(),
  telegramSignInButton: createTelegramSignInButtonDeps(),
  view: createViewConnectedAccounts(client),
})
