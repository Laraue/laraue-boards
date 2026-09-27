import type { ActionResult } from '#infrastructure/api/apiResult'
import type { GoogleSignInButtonDeps } from '~/components/google-sign-in-button/GoogleSignInButton.deps'
import type { TelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/TelegramSignInButton.deps'
import type {
  LoginViaGoogle,
  LoginViaTelegramMiniApp,
  LoginViaTelegramWidget,
} from '~/sections/auth/login/LoginPage.deps'

export type JoinOrganizationOutcome = 'joined' | 'sign-in-required'

export type JoinOrganization = (input: {
  code: string
}) => Promise<ActionResult<JoinOrganizationOutcome>>

export type JoinOrganizationPageDeps = {
  googleSignInButton: GoogleSignInButtonDeps
  join: JoinOrganization
  loginViaGoogle: LoginViaGoogle
  loginViaTelegramMiniApp: LoginViaTelegramMiniApp
  loginViaTelegramWidget: LoginViaTelegramWidget
  telegramSignInButton: TelegramSignInButtonDeps
}
