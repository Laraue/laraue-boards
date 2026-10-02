import type { ApiClient } from '#infrastructure/api/client'
import { isApiError, request } from '#infrastructure/api/request'
import { createGoogleSignInButtonDeps } from '~/components/google-sign-in-button/deps-impl'
import { createTelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/deps-impl'

import type { JoinOrganizationPageDeps } from './JoinOrganizationPage.deps'

type TelegramWindow = typeof globalThis & { Telegram?: { WebApp?: { initData?: string } } }

export const createJoinOrganizationPageDeps = (
  client: ApiClient,
  testInitData?: string,
): JoinOrganizationPageDeps => ({
  googleSignInButton: createGoogleSignInButtonDeps(),

  // A visitor who is not signed in yet is told to sign in rather than shown a failure.
  join: async ({ code }) => {
    try {
      await request(
        client.POST('/api/organizations/join/{code}', {
          params: { path: { code } },
          parseAs: 'text',
        }),
      )
      return 'joined'
    } catch (error) {
      if (isApiError(error, 401)) {
        return 'sign-in-required'
      }
      throw error
    }
  },

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
