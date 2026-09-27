import type { ActionResult } from '#infrastructure/api/apiResult'
import type { GoogleSignInButtonDeps } from '~/components/google-sign-in-button/GoogleSignInButton.deps'
import type { TelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/TelegramSignInButton.deps'
import type { TelegramUser } from '~/components/telegram-sign-in-button/TelegramSignInButton.types'

export type JoinOrganizationOutcome = 'joined' | 'sign-in-required'

export type JoinOrganization = (input: {
  code: string
}) => Promise<ActionResult<JoinOrganizationOutcome>>

export type LoginViaGoogle = (input: {
  code: string
  languageCode?: string
}) => Promise<ActionResult<true>>

export type LoginViaTelegramMiniApp = () => Promise<ActionResult<{ authenticated: boolean }>>

export type LoginViaTelegramWidget = (input: TelegramUser) => Promise<ActionResult<true>>

export type JoinOrganizationPageDeps = {
  googleSignInButton: GoogleSignInButtonDeps
  join: JoinOrganization
  loginViaGoogle: LoginViaGoogle
  loginViaTelegramMiniApp: LoginViaTelegramMiniApp
  loginViaTelegramWidget: LoginViaTelegramWidget
  telegramSignInButton: TelegramSignInButtonDeps
}
