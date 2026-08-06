import type { TourStateDeps, TourStatus } from '~/composables/useTour'

const APP_LAYOUT_TOUR_KEY = 'onboarding:app-layout:v1'

const isTourStatus = (value: null | string): value is TourStatus =>
  value === 'completed' || value === 'dismissed'

export const createAppLayoutTourDeps = (): TourStateDeps => ({
  loadStatus: async () => {
    const status = localStorage.getItem(APP_LAYOUT_TOUR_KEY)
    return isTourStatus(status) ? status : undefined
  },
  saveStatus: async (status) => localStorage.setItem(APP_LAYOUT_TOUR_KEY, status),
})
