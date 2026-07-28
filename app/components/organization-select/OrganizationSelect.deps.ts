import type { QueryResult } from '#infrastructure/api/apiResult'

import type { OrganizationSelectOption } from './OrganizationSelect.types'

export type LoadOrganizations = (input: {
  signal?: AbortSignal
}) => Promise<QueryResult<OrganizationSelectOption[]>>

export type OrganizationSelectDeps = {
  loadOrganizations: LoadOrganizations
}
