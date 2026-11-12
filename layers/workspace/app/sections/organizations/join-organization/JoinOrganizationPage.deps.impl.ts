import type { ApiClient } from '#infrastructure/api/client'
import { isApiError, request } from '#infrastructure/api/request'
import type { SignUpOrigin } from '#layers/core/app/signUpOrigin/signUpOrigin'
import { readBrowserSignUpOrigin } from '#layers/core/app/signUpOrigin/signUpOrigin'
import { createGoogleSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/GoogleSignInButton/GoogleSignInButton.deps.impl'
import { createTelegramSignInButtonDeps } from '#layers/workspace/app/sections/auth/shared/components/TelegramSignInButton/TelegramSignInButton.deps.impl'
import { loadTelegramMiniAppData } from '#layers/workspace/app/shared/utils/loadTelegramMiniAppData'
import {
  webSignUpFields,
  widgetSignUpFields,
} from '#layers/workspace/app/shared/utils/signUpFields'

import type { JoinOrganizationPageDeps } from './JoinOrganizationPage.deps'

/**
 * @param readSignUpOrigin the first page the visitor opened and the site that sent them (BRD-295), sent as is with
 * every sign-in; the backend works out where they came from (an invite page included) and keeps it only for a new
 * user.
 */
export const createJoinOrganizationPageDeps = (
  client: ApiClient,
  testInitData?: string,
  readSignUpOrigin: () => null | SignUpOrigin = readBrowserSignUpOrigin,
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
