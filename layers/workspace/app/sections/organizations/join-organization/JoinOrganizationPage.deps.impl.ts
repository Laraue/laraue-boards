import type { ApiClient } from '#infrastructure/api/client'
import { isApiError, request } from '#infrastructure/api/request'
import { readBrowserSignUpSource } from '#layers/core/app/signUpSource/signUpSource'
import { createGoogleSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/GoogleSignInButton/GoogleSignInButton.deps.impl'
import { createTelegramSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/TelegramSignInButton/TelegramSignInButton.deps.impl'
import { loadTelegramMiniAppData } from '#layers/workspace/app/shared/utils/loadTelegramMiniAppData'

import type { JoinOrganizationPageDeps } from './JoinOrganizationPage.deps'

/**
 * @param readSignUpSource where the visitor came from (BRD-295) - `invite` when they first opened this invite page
 * without a ref; sent with every sign-in, kept by the backend only for a new user.
 */
export const createJoinOrganizationPageDeps = (
  client: ApiClient,
  testInitData?: string,
  readSignUpSource: () => null | string = readBrowserSignUpSource,
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
