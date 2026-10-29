import type { TelegramSignInPopup } from './TelegramSignInButton.types'

/** Prepares Telegram's sign-in popup; undefined when Telegram's script can't be loaded. */
export type LoadTelegramSignIn = (input: {
  botId: string
  locale: string
}) => Promise<TelegramSignInPopup | undefined>

export type TelegramSignInButtonDeps = {
  loadTelegramSignIn: LoadTelegramSignIn
}
