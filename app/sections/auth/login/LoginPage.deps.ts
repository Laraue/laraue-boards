import type { ActionResult } from '#infrastructure/api/apiResult'

import type { GoogleSignIn, TelegramUser } from './LoginPage.types'

export type LoginViaTelegramMiniApp = () => Promise<ActionResult<{ authenticated: boolean }>>

export type LoginViaTelegramWidget = (input: TelegramUser) => Promise<ActionResult<true>>

export type LoginViaGoogle = (input: GoogleSignIn) => Promise<ActionResult<true>>

export type LoginPageDeps = {
  loginViaGoogle: LoginViaGoogle
  loginViaTelegramMiniApp: LoginViaTelegramMiniApp
  loginViaTelegramWidget: LoginViaTelegramWidget
}
