import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { LoginViaTelegramMiniApp } from '../LoginPage.deps'

type TelegramWindow = typeof globalThis & {
  Telegram?: { WebApp?: { initData?: string } }
}

export const createLoginViaTelegramMiniApp =
  (client: ApiClient, testInitData?: string): LoginViaTelegramMiniApp =>
  async () => {
    const initData = (globalThis as TelegramWindow).Telegram?.WebApp?.initData || testInitData
    if (!initData) {
      return { data: { authenticated: false }, status: 'success' }
    }
    return executeAction({
      map: () => ({ authenticated: true }),
      request: () =>
        client.POST('/api/user/auth-via-mini-app', {
          body: { initData },
          parseAs: 'text',
        }),
    })
  }
