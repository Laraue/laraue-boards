import type { Ref } from 'vue'

import type { TourStateDeps, TourStep } from '~/composables/useTour'
import { useTour } from '~/composables/useTour'

import type { IssuesPageData } from './IssuesPage.types'

const steps = [
  {
    description:
      'This page holds every issue from every space. Search by content, or narrow the list by space, assignee, status, and your own attributes.',
    placement: 'bottom',
    target: '[data-tour="issues-filters"]',
    title: 'Find any issue',
  },
  {
    description: 'Create an issue here when you are ready to capture a new task or request.',
    placement: 'left',
    target: '[data-tour="create-issue"]',
    title: 'Add an issue',
  },
] satisfies TourStep[]

export const useIssuesTour = (
  data: Readonly<Ref<IssuesPageData | undefined>>,
  deps: TourStateDeps,
): void => {
  const routes = useOrganizationRoutes()

  useTour({
    finish: () =>
      data.value?.spaces.length
        ? { run: () => void navigateTo(routes.newIssue()), text: 'Create an issue' }
        : undefined,
    priority: 1,
    ready: () => data.value !== undefined,
    state: deps,
    steps: () => steps,
  })
}
