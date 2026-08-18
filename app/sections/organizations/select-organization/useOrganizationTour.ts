import type { Ref } from 'vue'

import type { TourStateDeps, TourStep } from '~/composables/useTour'
import { useTour } from '~/composables/useTour'

import type { OrganizationPickerItem } from './OrganizationPickerPage.types'

const steps = [
  {
    description: 'Use your personal organization for your own projects and tasks.',
    placement: 'right',
    target: '[data-tour="personal-organization"]',
    title: 'Your personal workspace',
  },
  {
    description: 'Create another organization when you want to work together with a team.',
    placement: 'top',
    target: '[data-tour="create-organization"]',
    title: 'Bring your team together',
  },
] satisfies TourStep[]

export const useOrganizationTour = (
  organizations: Readonly<Ref<OrganizationPickerItem[] | undefined>>,
  deps: TourStateDeps,
): void =>
  useTour({
    ready: () => organizations.value !== undefined,
    state: deps,
    steps: () => steps,
  })
