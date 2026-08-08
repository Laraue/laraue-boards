import type { Ref } from 'vue'

import type { TourStateDeps, TourStep } from '~/composables/useTour'
import { useTour } from '~/composables/useTour'

import type { AppLayoutData } from './AppLayout.types'

const buildSteps = (data: AppLayoutData | undefined): TourStep[] => [
  {
    description: `Switch between organizations here — ${data?.organization.name ?? 'each one'} keeps its own spaces and issues.`,
    placement: 'right',
    target: '[data-tour="organization-switcher"]',
    title: 'Your organization',
  },
  {
    description: 'Spaces group related boards and issues for a project or area of work.',
    placement: 'right',
    target: '[data-tour="create-space"]',
    title: 'Organize work with spaces',
  },
  {
    description: 'Members, attributes, and the rest of the organization settings live here.',
    placement: 'right',
    target: '[data-tour="organization-settings"]',
    title: 'Workspace settings',
  },
]

export const useAppLayoutTour = (
  data: Readonly<Ref<AppLayoutData | undefined>>,
  deps: TourStateDeps,
): void => {
  const routes = useOrganizationRoutes()

  useTour({
    finish: () => {
      const organization = data.value?.organization
      if (!organization?.canCreateSpaces || data.value?.spaces.length) {
        return undefined
      }
      return { run: () => void navigateTo(routes.newSpace()), text: 'Create a space' }
    },
    greetingName: () => data.value?.user.name.split(' ')[0],
    priority: 0,
    ready: () => import.meta.client && data.value !== undefined && innerWidth > 760,
    state: deps,
    steps: () => buildSteps(data.value),
  })
}
