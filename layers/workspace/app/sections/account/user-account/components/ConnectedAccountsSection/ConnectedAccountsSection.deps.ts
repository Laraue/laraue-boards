import type { GoogleSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/GoogleSignInButton/GoogleSignInButton.deps'
import type { TelegramSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/TelegramSignInButton/TelegramSignInButton.deps'
import type { TelegramUser } from '#layers/workspace/app/sections/auth/shared/components/TelegramSignInButton/TelegramSignInButton.types'

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
  detectTelegramMiniApp: () => Promise<boolean>
  googleSignInButton: GoogleSignInButtonDeps
  telegramSignInButton: TelegramSignInButtonDeps
  view: (input: { signal?: AbortSignal }) => Promise<ConnectedAccounts>
}
