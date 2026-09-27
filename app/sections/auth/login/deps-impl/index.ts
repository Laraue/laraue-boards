import type { ApiClient } from '#infrastructure/api/client'
import { createGoogleSignInButtonDeps } from '~/components/google-sign-in-button/deps-impl'
import { createTelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/deps-impl'

import type { LoginPageDeps } from '../LoginPage.deps'
import { createLoginViaGoogle } from './loginViaGoogle'
import { createLoginViaTelegramMiniApp } from './loginViaTelegramMiniApp'
import { createLoginViaTelegramWidget } from './loginViaTelegramWidget'

export const createLoginPageDeps = (client: ApiClient, testInitData?: string): LoginPageDeps => ({
  googleSignInButton: createGoogleSignInButtonDeps(),
  loginViaGoogle: createLoginViaGoogle(client),
  loginViaTelegramMiniApp: createLoginViaTelegramMiniApp(client, testInitData),
  loginViaTelegramWidget: createLoginViaTelegramWidget(client),
  telegramSignInButton: createTelegramSignInButtonDeps(),
})
