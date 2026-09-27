import { loadScript } from '~/utils/loadScript'

import type { LoadTelegramSignIn } from '../TelegramSignInButton.deps'
import type { TelegramUser } from '../TelegramSignInButton.types'

type TelegramLogin = {
  auth: (
    options: { bot_id: string; lang: string; request_access: 'write' },
    callback: (user: false | TelegramUser) => void,
  ) => void
}

export type TelegramLoginWindow = typeof globalThis & { Telegram?: { Login?: TelegramLogin } }

export const createLoadTelegramSignIn =
  (): LoadTelegramSignIn =>
  async ({ botId, locale }) => {
    const telegramWindow = globalThis as TelegramLoginWindow
    if (!telegramWindow.Telegram?.Login) {
      await loadScript('https://telegram.org/js/telegram-widget.js?22').catch(() => undefined)
    }
    const login = telegramWindow.Telegram?.Login
    if (!login) {
      return undefined
    }

    return {
      open: () =>
        new Promise((resolve) =>
          login.auth({ bot_id: botId, lang: locale, request_access: 'write' }, (user) =>
            resolve(user || undefined),
          ),
        ),
    }
  }
