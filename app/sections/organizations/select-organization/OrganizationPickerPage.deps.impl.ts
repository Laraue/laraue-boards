import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { DEFAULT_COLOR } from '~/constants/colors'
import { getOrganizationKey } from '~/utils/organizationKey'

import type { OrganizationPickerPageDeps } from './OrganizationPickerPage.deps'

const ONBOARDING_ID = 'OrganizationsV1'

export const createOrganizationPickerPageDeps = (
  client: ApiClient,
): OrganizationPickerPageDeps => ({
  leave: async ({ id }) => {
    await request(
      client.POST('/api/organizations/{id}/leave', { params: { path: { id: Number(id) } } }),
    )
  },

  select: async ({ organizationId }) => {
    await request(
      client.POST('/api/organizations/login', { body: { organizationId }, parseAs: 'text' }),
    )
  },

  // The tour is optional: a failure to load or save its state never reaches the page.
  tour: {
    loadStatus: async () => {
      const onboarding = await request(
        client.GET('/api/user/onboarding/{onboardingId}', {
          params: { path: { onboardingId: ONBOARDING_ID } },
        }),
      ).catch(() => undefined)
      const status = onboarding?.status
      return status === 'Completed' ? 'completed' : status === 'Dismissed' ? 'dismissed' : undefined
    },
    saveStatus: async (status) => {
      await request(
        client.PUT('/api/user/onboarding/{onboardingId}', {
          body: { status: status === 'completed' ? 'Completed' : 'Dismissed' },
          params: { path: { onboardingId: ONBOARDING_ID } },
        }),
      ).catch(() => undefined)
    },
  },

  view: async ({ signal }) => {
    const organizations = await request(client.GET('/api/organizations', { signal }))
    return organizations.map((organization) => ({
      canLeave: organization.canLeave,
      color: organization.color ?? DEFAULT_COLOR,
      description: organization.isPersonal ? 'Personal organization' : 'Team organization',
      id: String(organization.id),
      initial: organization.name[0] ?? '?',
      isPersonal: organization.isPersonal,
      key: getOrganizationKey(organization),
      name: organization.name,
    }))
  },
})
