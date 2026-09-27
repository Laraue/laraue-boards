import type { ApiClient } from '#infrastructure/api/client'
import { createGoogleSignInButtonDeps } from '~/components/google-sign-in-button/deps-impl'
import { createTelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/deps-impl'
import type { JoinOrganizationPageDeps } from '../JoinOrganizationPage.deps'
import { createJoinOrganization } from './joinOrganization'
import { createLoginViaGoogle } from './loginViaGoogle'
import { createLoginViaTelegramMiniApp } from './loginViaTelegramMiniApp'
import { createLoginViaTelegramWidget } from './loginViaTelegramWidget'

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
