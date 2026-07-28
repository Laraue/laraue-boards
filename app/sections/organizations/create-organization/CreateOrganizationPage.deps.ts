import type { ActionResult } from '#infrastructure/api/apiResult'

import type { CreateOrganizationInput } from './CreateOrganizationPage.types'

export type CreateOrganization = (
  input: CreateOrganizationInput,
) => Promise<ActionResult<{ organizationId: string }>>

export type CreateOrganizationPageDeps = {
  create: CreateOrganization
}
