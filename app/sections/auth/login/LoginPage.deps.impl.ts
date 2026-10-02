import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { createGoogleSignInButtonDeps } from '~/components/google-sign-in-button/deps-impl'
import { createTelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/deps-impl'

import type { LoginPageDeps } from './LoginPage.deps'

type TelegramWindow = typeof globalThis & { Telegram?: { WebApp?: { initData?: string } } }

export const createLoginPageDeps = (client: ApiClient, testInitData?: string): LoginPageDeps => ({
  googleSignInButton: createGoogleSignInButtonDeps(),

  loginViaGoogle: async ({ code, languageCode }) => {
    await request(
      client.POST('/api/user/auth-via-google', {
        body: { code, languageCode: languageCode?.split('-')[0]?.toLowerCase() || null },
        parseAs: 'text',
      }),
    )
  },

  loginViaTelegramMiniApp: async () => {
    const initData = (globalThis as TelegramWindow).Telegram?.WebApp?.initData || testInitData
    if (!initData) {
      return false
    }
    await request(
      client.POST('/api/user/auth-via-mini-app', { body: { initData }, parseAs: 'text' }),
    )
    return true
  },

  loginViaTelegramWidget: async (input) => {
    await request(client.POST('/api/user/auth', { body: input, parseAs: 'text' }))
  },

  telegramSignInButton: createTelegramSignInButtonDeps(),
})
