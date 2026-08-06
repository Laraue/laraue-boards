import type { TourStateDeps, TourStatus } from '~/composables/useTour'

const ORGANIZATION_TOUR_KEY = 'onboarding:organizations:v1'

const isOrganizationTourStatus = (value: null | string): value is TourStatus =>
  value === 'completed' || value === 'dismissed'

export const createOrganizationTourDeps = (): TourStateDeps => ({
  loadStatus: async () => {
    const status = localStorage.getItem(ORGANIZATION_TOUR_KEY)
    return isOrganizationTourStatus(status) ? status : undefined
  },
  saveStatus: async (status) => localStorage.setItem(ORGANIZATION_TOUR_KEY, status),
})
