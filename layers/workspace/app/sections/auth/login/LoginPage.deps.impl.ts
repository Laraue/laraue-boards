import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import type { SignUpOrigin } from '#layers/core/app/signUpOrigin/signUpOrigin'
import { readBrowserSignUpOrigin } from '#layers/core/app/signUpOrigin/signUpOrigin'
import { createGoogleSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/GoogleSignInButton/GoogleSignInButton.deps.impl'
import { createTelegramSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/TelegramSignInButton/TelegramSignInButton.deps.impl'
import { loadTelegramMiniAppData } from '#layers/workspace/app/shared/utils/loadTelegramMiniAppData'
import {
  webSignUpFields,
  widgetSignUpFields,
} from '#layers/workspace/app/shared/utils/signUpFields'

import type { LoginPageDeps } from './LoginPage.deps'

/**
 * @param readSignUpOrigin the first page the visitor opened and the site that sent them (BRD-295), sent as is with
 * every sign-in; the backend works out where they came from and keeps it only for a new user.
 */
export const createLoginPageDeps = (
  client: ApiClient,
  testInitData?: string,
  readSignUpOrigin: () => null | SignUpOrigin = readBrowserSignUpOrigin,
): LoginPageDeps => ({
  googleSignInButton: createGoogleSignInButtonDeps(),

  loginViaGoogle: async ({ code, languageCode }) => {
    await request(
      client.POST('/api/user/auth-via-google', {
        body: {
          code,
          languageCode: languageCode?.split('-')[0]?.toLowerCase() || null,
          ...webSignUpFields(readSignUpOrigin()),
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
        body: { initData, ...webSignUpFields(readSignUpOrigin()) },
        parseAs: 'text',
      }),
    )
    return true
  },

  loginViaTelegramWidget: async (input) => {
    await request(
      client.POST('/api/user/auth', {
        body: { ...input, ...widgetSignUpFields(readSignUpOrigin()) },
        parseAs: 'text',
      }),
    )
  },

  telegramSignInButton: createTelegramSignInButtonDeps(),
})
