import { loadScript } from './loadScript'

type TelegramWindow = typeof globalThis & { Telegram?: { WebApp?: { initData?: string } } }

export const loadTelegramMiniAppData = async (): Promise<string | undefined> => {
  if (typeof window === 'undefined') {
    return undefined
  }
  const telegramWindow = globalThis as TelegramWindow
  if (!telegramWindow.Telegram?.WebApp) {
    try {
      await loadScript('https://telegram.org/js/telegram-web-app.js?61')
    } catch {
      return undefined
    }
  }
  return telegramWindow.Telegram?.WebApp?.initData || undefined
}
