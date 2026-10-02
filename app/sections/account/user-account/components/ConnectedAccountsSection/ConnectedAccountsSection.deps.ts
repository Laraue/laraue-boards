import type { GoogleSignInButtonDeps } from '~/components/google-sign-in-button/GoogleSignInButton.deps'
import type { TelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/TelegramSignInButton.deps'
import type { TelegramUser } from '~/components/telegram-sign-in-button/TelegramSignInButton.types'

export type ConnectedAccounts = {
  google: boolean
  telegram: boolean
}

export type ConnectOutcome =
  | 'linked'
  | 'owner-has-data'
  | 'owner-used-by-another-service'
  | 'user-has-other-account'

export type ConnectedAccountsSectionDeps = {
  connectGoogle: (input: { code: string }) => Promise<ConnectOutcome>
  connectTelegram: (input: TelegramUser) => Promise<ConnectOutcome>
  googleSignInButton: GoogleSignInButtonDeps
  telegramSignInButton: TelegramSignInButtonDeps
  view: (input: { signal?: AbortSignal }) => Promise<ConnectedAccounts>
}
