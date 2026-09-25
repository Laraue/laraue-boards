export type GoogleSignIn = {
  idToken: string
  languageCode?: string
}

export type TelegramUser = {
  auth_date: number
  first_name: string
  hash: string
  id: number
  last_name?: string
  photo_url?: string
  username?: string
}
