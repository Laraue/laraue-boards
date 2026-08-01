import type { ActionResult } from '#infrastructure/api/apiResult'
import type {
  LoginViaTelegramMiniApp,
  LoginViaTelegramWidget,
} from '~/sections/auth/login/LoginPage.deps'

export type JoinOrganizationOutcome = 'joined' | 'sign-in-required'

export type JoinOrganization = (input: {
  code: string
}) => Promise<ActionResult<JoinOrganizationOutcome>>

export type JoinOrganizationPageDeps = {
  join: JoinOrganization
  loginViaTelegramMiniApp: LoginViaTelegramMiniApp
  loginViaTelegramWidget: LoginViaTelegramWidget
}
