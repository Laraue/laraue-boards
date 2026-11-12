import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { readBrowserSignUpSource } from '#layers/core/app/signUpSource/signUpSource'
import { createGoogleSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/GoogleSignInButton/GoogleSignInButton.deps.impl'
import { createTelegramSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/TelegramSignInButton/TelegramSignInButton.deps.impl'
import { loadTelegramMiniAppData } from '#layers/workspace/app/shared/utils/loadTelegramMiniAppData'

import type { LoginPageDeps } from './LoginPage.deps'

/**
 * @param readSignUpSource where the visitor came from (BRD-295), sent with every sign-in; the backend keeps it only
 * for a new user.
 */
export const createLoginPageDeps = (
  client: ApiClient,
  testInitData?: string,
  readSignUpSource: () => null | string = readBrowserSignUpSource,
): LoginPageDeps => ({
  googleSignInButton: createGoogleSignInButtonDeps(),

  loginViaGoogle: async ({ code, languageCode }) => {
    await request(
      client.POST('/api/user/auth-via-google', {
        body: {
          code,
          languageCode: languageCode?.split('-')[0]?.toLowerCase() || null,
          signUpSource: readSignUpSource() ?? undefined,
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
    await request(
      client.POST('/api/user/auth-via-mini-app', {
        body: { initData, signUpSource: readSignUpSource() ?? undefined },
        parseAs: 'text',
      }),
    )
    return true
  },

  loginViaTelegramWidget: async (input) => {
    await request(
      client.POST('/api/user/auth', {
        body: { ...input, sign_up_source: readSignUpSource() ?? undefined },
        parseAs: 'text',
      }),
    )
  },

  telegramSignInButton: createTelegramSignInButtonDeps(),
})
