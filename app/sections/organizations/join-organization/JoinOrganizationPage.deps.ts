import type { GoogleSignInButtonDeps } from '~/components/google-sign-in-button/GoogleSignInButton.deps'
import type { TelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/TelegramSignInButton.deps'
import type { TelegramUser } from '~/components/telegram-sign-in-button/TelegramSignInButton.types'

export type JoinOrganizationPageDeps = {
  googleSignInButton: GoogleSignInButtonDeps
  join: (input: { code: string }) => Promise<'joined' | 'sign-in-required'>
  loginViaGoogle: (input: { code: string; languageCode?: string }) => Promise<void>
  // Resolves false outside a Telegram Mini App, where there is nothing to sign in with.
  loginViaTelegramMiniApp: () => Promise<boolean>
  loginViaTelegramWidget: (input: TelegramUser) => Promise<void>
  telegramSignInButton: TelegramSignInButtonDeps
}
