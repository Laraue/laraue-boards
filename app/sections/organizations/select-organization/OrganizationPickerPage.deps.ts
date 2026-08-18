import type { ActionResult } from '#infrastructure/api/apiResult'
import type { QueryResult } from '#infrastructure/api/apiResult'
import type { TourStateDeps } from '~/composables/useTour'

import type { OrganizationPickerItem } from './OrganizationPickerPage.types'

export type SelectOrganization = (input: { organizationId: string }) => Promise<ActionResult<true>>

export type ViewOrganizationPicker = (input: {
  signal?: AbortSignal
}) => Promise<QueryResult<OrganizationPickerItem[]>>

export type OrganizationPickerPageDeps = {
  select: SelectOrganization
  tour: TourStateDeps
  view: ViewOrganizationPicker
}
