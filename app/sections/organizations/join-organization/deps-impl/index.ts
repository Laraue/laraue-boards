import type { ApiClient } from '#infrastructure/api/client'
import { createLoginViaTelegramMiniApp } from '~/sections/auth/login/deps-impl/loginViaTelegramMiniApp'
import { createLoginViaTelegramWidget } from '~/sections/auth/login/deps-impl/loginViaTelegramWidget'

import type { JoinOrganizationPageDeps } from '../JoinOrganizationPage.deps'
import { createJoinOrganization } from './joinOrganization'

export const createJoinOrganizationPageDeps = (
  client: ApiClient,
  testInitData?: string,
): JoinOrganizationPageDeps => ({
  join: createJoinOrganization(client),
  loginViaTelegramMiniApp: createLoginViaTelegramMiniApp(client, testInitData),
  loginViaTelegramWidget: createLoginViaTelegramWidget(client),
})
