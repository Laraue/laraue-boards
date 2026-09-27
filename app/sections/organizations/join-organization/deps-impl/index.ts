import type { ApiClient } from '#infrastructure/api/client'
import { createGoogleSignInButtonDeps } from '~/components/google-sign-in-button/deps-impl'
import { createTelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/deps-impl'
import { createLoginViaGoogle } from '~/sections/auth/login/deps-impl/loginViaGoogle'
import { createLoginViaTelegramMiniApp } from '~/sections/auth/login/deps-impl/loginViaTelegramMiniApp'
import { createLoginViaTelegramWidget } from '~/sections/auth/login/deps-impl/loginViaTelegramWidget'

import type { JoinOrganizationPageDeps } from '../JoinOrganizationPage.deps'
import { createJoinOrganization } from './joinOrganization'

export const createJoinOrganizationPageDeps = (
  client: ApiClient,
  testInitData?: string,
): JoinOrganizationPageDeps => ({
  googleSignInButton: createGoogleSignInButtonDeps(),
  join: createJoinOrganization(client),
  loginViaGoogle: createLoginViaGoogle(client),
  loginViaTelegramMiniApp: createLoginViaTelegramMiniApp(client, testInitData),
  loginViaTelegramWidget: createLoginViaTelegramWidget(client),
  telegramSignInButton: createTelegramSignInButtonDeps(),
})
