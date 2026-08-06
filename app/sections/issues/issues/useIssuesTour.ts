import type { Ref } from 'vue'

import type { TourStateDeps, TourStep } from '~/composables/useTour'
import { useTour } from '~/composables/useTour'

import type { IssuesPageData } from './IssuesPage.types'

const steps = [
  {
    description: 'This page brings together every issue from every space in the organization.',
    title: 'All your work in one place',
  },
  {
    description: 'Search by issue content whenever you need to find something quickly.',
    placement: 'bottom',
    target: '[data-tour="issues-search"]',
    title: 'Find an issue',
  },
  {
    description: 'Narrow the list by space, assignee, status, or your organization attributes.',
    placement: 'bottom',
    target: '[data-tour="issues-filters"]',
    title: 'Focus the list',
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
): void =>
  useTour({
    priority: 1,
    ready: () => data.value !== undefined,
    state: deps,
    steps,
  })
