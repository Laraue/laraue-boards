import type { ActionResult } from '#infrastructure/api/apiResult'

import type { TelegramUser } from './LoginPage.types'

export type LoginViaTelegramMiniApp = () => Promise<ActionResult<{ authenticated: boolean }>>

export type LoginViaTelegramWidget = (input: TelegramUser) => Promise<ActionResult<true>>

export type LoginPageDeps = {
  loginViaTelegramMiniApp: LoginViaTelegramMiniApp
  loginViaTelegramWidget: LoginViaTelegramWidget
}
