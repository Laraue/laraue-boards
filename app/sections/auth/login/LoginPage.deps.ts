import type { ActionResult } from '#infrastructure/api/apiResult'
import type { GoogleSignInButtonDeps } from '~/components/google-sign-in-button/GoogleSignInButton.deps'
import type { TelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/TelegramSignInButton.deps'

import type { GoogleSignIn, TelegramUser } from './LoginPage.types'

export type LoginViaTelegramMiniApp = () => Promise<ActionResult<{ authenticated: boolean }>>

export type LoginViaTelegramWidget = (input: TelegramUser) => Promise<ActionResult<true>>

export type LoginViaGoogle = (input: GoogleSignIn) => Promise<ActionResult<true>>

export type LoginPageDeps = {
  googleSignInButton: GoogleSignInButtonDeps
  loginViaGoogle: LoginViaGoogle
  loginViaTelegramMiniApp: LoginViaTelegramMiniApp
  loginViaTelegramWidget: LoginViaTelegramWidget
  telegramSignInButton: TelegramSignInButtonDeps
}
