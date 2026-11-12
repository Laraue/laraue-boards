import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import type { SignUpSourceUrls } from '#layers/core/app/analytics/signUpSourceUrls/signUpSourceUrls'
import { createGoogleSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/GoogleSignInButton/GoogleSignInButton.deps.impl'
import { createTelegramSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/TelegramSignInButton/TelegramSignInButton.deps.impl'
import { loadTelegramMiniAppData } from '#layers/workspace/app/shared/utils/loadTelegramMiniAppData'

import type { LoginPageDeps } from './LoginPage.deps'

export const createLoginPageDeps = (
  client: ApiClient,
  readSignUpSourceUrls: () => null | SignUpSourceUrls,
  testInitData?: string,
): LoginPageDeps => ({
  googleSignInButton: createGoogleSignInButtonDeps(),

  loginViaGoogle: async ({ code, languageCode }) => {
    const signUpSourceUrls = readSignUpSourceUrls()
    await request(
      client.POST('/api/user/auth-via-google', {
        body: {
          code,
          languageCode: languageCode?.split('-')[0]?.toLowerCase() || null,
          signUpLandingUrl: signUpSourceUrls?.landingUrl,
          signUpReferrer: signUpSourceUrls?.referrer,
        },
        parseAs: 'text',
      }),
    )
  },

  loginViaTelegramMiniApp: async () => {
    const initData = (await loadTelegramMiniAppData()) || testInitData
    if (!initData) {
      return false
    }
    const signUpSourceUrls = readSignUpSourceUrls()
    await request(
      client.POST('/api/user/auth-via-mini-app', {
        body: {
          initData,
          signUpLandingUrl: signUpSourceUrls?.landingUrl,
          signUpReferrer: signUpSourceUrls?.referrer,
        },
        parseAs: 'text',
      }),
    )
    return true
  },

  loginViaTelegramWidget: async (input) => {
    const signUpSourceUrls = readSignUpSourceUrls()
    await request(
      client.POST('/api/user/auth', {
        body: {
          ...input,
          sign_up_landing_url: signUpSourceUrls?.landingUrl,
          sign_up_referrer: signUpSourceUrls?.referrer,
        },
        parseAs: 'text',
      }),
    )
  },

  telegramSignInButton: createTelegramSignInButtonDeps(),
})
