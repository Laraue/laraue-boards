export type TelegramUser = {
  auth_date: number
  first_name: string
  hash: string
  id: number
  last_name?: string
  photo_url?: string
  username?: string
}

/**
 * Telegram's sign-in popup, ready to open. Browsers allow a popup only from a click handler, so
 * `open` must be called synchronously from one; it resolves with undefined if the user closes it.
 */
export type TelegramSignInPopup = {
  open: () => Promise<TelegramUser | undefined>
}
