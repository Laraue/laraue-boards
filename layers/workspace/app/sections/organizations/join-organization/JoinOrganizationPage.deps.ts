import type { GoogleSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/GoogleSignInButton/GoogleSignInButton.deps'
import type { TelegramSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/TelegramSignInButton/TelegramSignInButton.deps'
import type { TelegramUser } from '#layers/workspace/app/sections/auth/shared/components/TelegramSignInButton/TelegramSignInButton.types'

export type JoinOrganizationPageDeps = {
  googleSignInButton: GoogleSignInButtonDeps
  join: (input: { code: string }) => Promise<'joined' | 'sign-in-required'>
  loginViaGoogle: (input: { code: string; languageCode?: string }) => Promise<void>
  // Resolves false outside a Telegram Mini App, where there is nothing to sign in with.
  loginViaTelegramMiniApp: () => Promise<boolean>
  loginViaTelegramWidget: (input: TelegramUser) => Promise<void>
  telegramSignInButton: TelegramSignInButtonDeps
}
