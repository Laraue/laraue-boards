import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import type { TourStateDeps } from '~/composables/useTour'

const ONBOARDING_ID = 'AppLayoutV1'

export const createAppLayoutTourDeps = (client: ApiClient): TourStateDeps => ({
  loadStatus: async () => {
    const response = await tryRequest(() =>
      client.GET('/api/user/onboarding/{onboardingId}', {
        params: { path: { onboardingId: ONBOARDING_ID } },
      }),
    )
    const status = response && 'data' in response ? response.data?.status : undefined

    return status === 'Completed' ? 'completed' : status === 'Dismissed' ? 'dismissed' : undefined
  },
  saveStatus: async (status) => {
    await tryRequest(() =>
      client.PUT('/api/user/onboarding/{onboardingId}', {
        body: { status: status === 'completed' ? 'Completed' : 'Dismissed' },
        params: { path: { onboardingId: ONBOARDING_ID } },
      }),
    )
  },
})
