import type { TourStateDeps } from '~/composables/useTour'

export type OrganizationPickerItem = {
  canLeave: boolean
  color: string
  description: string
  id: string
  initial: string
  isPersonal: boolean
  key: string
  name: string
}

export type OrganizationPickerPageDeps = {
  leave: (input: { id: string }) => Promise<void>
  select: (input: { organizationId: string }) => Promise<void>
  tour: TourStateDeps
  view: (input: { signal?: AbortSignal }) => Promise<OrganizationPickerItem[]>
}
