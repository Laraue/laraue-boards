import type { Ref } from 'vue'

import type { TourStateDeps, TourStep } from '~/composables/useTour'
import { useTour } from '~/composables/useTour'

import type { AppLayoutData } from './AppLayout.types'

const steps = [
  {
    description: 'Here is a quick tour of the tools available in every organization.',
    title: 'Welcome to your workspace',
  },
  {
    description: 'See your current organization here or switch to another workspace.',
    placement: 'right',
    target: '[data-tour="organization-switcher"]',
    title: 'Your organization',
  },
  {
    description: 'Review every issue across all spaces from one place.',
    placement: 'right',
    target: '[data-tour="all-issues"]',
    title: 'All issues',
  },
  {
    description: 'Spaces group related boards and issues for a project or area of work.',
    placement: 'right',
    target: '[data-tour="create-space"]',
    title: 'Organize work with spaces',
  },
  {
    description: 'Manage the organization, members, attributes, and data from this section.',
    placement: 'right',
    target: '[data-tour="organization-settings"]',
    title: 'Workspace settings',
  },
  {
    description: 'Your profile, theme switcher, and sign out action are always available here.',
    placement: 'right',
    target: '[data-tour="user-controls"]',
    title: 'Your account',
  },
] satisfies TourStep[]

export const useAppLayoutTour = (
  data: Readonly<Ref<AppLayoutData | undefined>>,
  deps: TourStateDeps,
): void =>
  useTour({
    priority: 0,
    ready: () => import.meta.client && data.value !== undefined && innerWidth > 760,
    state: deps,
    steps,
  })
