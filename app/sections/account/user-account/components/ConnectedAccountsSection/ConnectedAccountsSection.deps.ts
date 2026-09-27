import type { ActionResult, QueryResult } from '#infrastructure/api/apiResult'
import type { GoogleSignInButtonDeps } from '~/components/google-sign-in-button/GoogleSignInButton.deps'
import type { TelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/TelegramSignInButton.deps'
import type { TelegramUser } from '~/components/telegram-sign-in-button/TelegramSignInButton.types'

import type { ConnectedAccounts, ConnectOutcome } from './ConnectedAccountsSection.types'

export type ConnectedAccountsSectionDeps = {
  connectGoogle: (input: { code: string }) => Promise<ActionResult<ConnectOutcome>>
  connectTelegram: (input: TelegramUser) => Promise<ActionResult<ConnectOutcome>>
  googleSignInButton: GoogleSignInButtonDeps
  telegramSignInButton: TelegramSignInButtonDeps
  view: (input: { signal?: AbortSignal }) => Promise<QueryResult<ConnectedAccounts>>
}
