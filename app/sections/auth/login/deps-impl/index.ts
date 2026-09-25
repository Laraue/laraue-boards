import type { ApiClient } from '#infrastructure/api/client'

import type { LoginPageDeps } from '../LoginPage.deps'
import { createLoginViaGoogle } from './loginViaGoogle'
import { createLoginViaTelegramMiniApp } from './loginViaTelegramMiniApp'
import { createLoginViaTelegramWidget } from './loginViaTelegramWidget'

export const createLoginPageDeps = (client: ApiClient, testInitData?: string): LoginPageDeps => ({
  loginViaGoogle: createLoginViaGoogle(client),
  loginViaTelegramMiniApp: createLoginViaTelegramMiniApp(client, testInitData),
  loginViaTelegramWidget: createLoginViaTelegramWidget(client),
})
