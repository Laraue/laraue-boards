import type { TourStateDeps, TourStatus } from '~/composables/useTour'

const ISSUES_TOUR_KEY = 'onboarding:issues:v1'

const isTourStatus = (value: null | string): value is TourStatus =>
  value === 'completed' || value === 'dismissed'

export const createIssuesTourDeps = (): TourStateDeps => ({
  loadStatus: async () => {
    const status = localStorage.getItem(ISSUES_TOUR_KEY)
    return isTourStatus(status) ? status : undefined
  },
  saveStatus: async (status) => localStorage.setItem(ISSUES_TOUR_KEY, status),
})
