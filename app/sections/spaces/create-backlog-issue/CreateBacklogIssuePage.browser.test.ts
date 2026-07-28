import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { CreateBacklogIssuePageDeps } from './CreateBacklogIssuePage.deps'
import type { CreateBacklogIssuePageData } from './CreateBacklogIssuePage.types'
import CreateBacklogIssuePage from './CreateBacklogIssuePage.vue'

const pageData: CreateBacklogIssuePageData = {
  attributes: [],
  boardId: '8',
  boardName: 'Backlog',
  spaceKey: 'product-ABCD',
}

const createDeps = (
  overrides: Partial<CreateBacklogIssuePageDeps> = {},
): CreateBacklogIssuePageDeps => ({
  form: {
    assigneeSelect: {
      loadAssignees: vi.fn<CreateBacklogIssuePageDeps['form']['assigneeSelect']['loadAssignees']>(),
    },
    boardSelect: {
      loadBoards: vi.fn<CreateBacklogIssuePageDeps['form']['boardSelect']['loadBoards']>(),
    },
    create: vi.fn<CreateBacklogIssuePageDeps['form']['create']>(),
    spaceSelect: {
      loadSpaces: vi.fn<CreateBacklogIssuePageDeps['form']['spaceSelect']['loadSpaces']>(),
    },
    statusSelect: {
      loadStatuses: vi.fn<CreateBacklogIssuePageDeps['form']['statusSelect']['loadStatuses']>(),
    },
  },
  view: vi.fn<CreateBacklogIssuePageDeps['view']>(async () => ({
    data: pageData,
    status: 'success',
  })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: CreateBacklogIssuePageDeps, onCreated: (issueKey: string) => void) => {
  currentWrapper = await mountSuspended(CreateBacklogIssuePage, {
    attachTo: document.body,
    props: { deps, onCreated, spaceKey: 'product-ABCD' },
    route: '/organizations/acme-ab12/spaces/product-ABCD/backlog/issues/new',
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows the backlog selected by the page', async () => {
  await mount(createDeps(), vi.fn<(issueKey: string) => void>())

  await expect.element(page.getByText('Backlog', { exact: true })).toBeInTheDocument()
})
