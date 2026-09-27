export type { TelegramUser } from '~/components/telegram-sign-in-button/TelegramSignInButton.types'

export type GoogleSignIn = {
  /** Authorization code from Google's OAuth popup; the backend exchanges it for an ID token. */
  code: string
  languageCode?: string
}
