import type { Ref } from 'vue'

import type { TourStateDeps, TourStep } from '~/composables/useTour'
import { useTour } from '~/composables/useTour'

import type { AppLayoutData } from './AppLayout.types'

const buildSteps = (data: AppLayoutData | undefined): TourStep[] => {
  const steps: TourStep[] = [
    {
      description: `Switch between organizations here — ${data?.organization.name ?? 'each one'} keeps its own spaces and issues.`,
      placement: 'right',
      target: '[data-tour="organization-switcher"]',
      title: 'Your organization',
    },
    {
      description:
        'An issue is a task or request. All issues shows them across every space, so nothing gets lost between projects.',
      placement: 'right',
      target: '[data-tour="all-issues"]',
      title: 'Issues are your tasks',
    },
    {
      description:
        'A space is a project or a large area of work — similar to an epic. Inside it, the backlog holds unscheduled issues and boards show their workflow.',
      placement: 'right',
      target: '[data-tour="spaces"]',
      title: 'Spaces, backlog, and boards',
    },
  ]

  if (
    data?.organization.canUpdate ||
    data?.organization.canManage ||
    data?.organization.canManageAttributes ||
    data?.organization.canMassMove
  ) {
    steps.push({
      description: 'Members, attributes, and the rest of the organization settings live here.',
      placement: 'right',
      target: '[data-tour="organization-settings"]',
      title: 'Workspace settings',
    })
  }

  return steps
}

export const useAppLayoutTour = (
  data: Readonly<Ref<AppLayoutData | undefined>>,
  deps: TourStateDeps,
): void => {
  useTour({
    ready: () => import.meta.client && data.value !== undefined && innerWidth > 760,
    state: deps,
    steps: () => buildSteps(data.value),
  })
}
