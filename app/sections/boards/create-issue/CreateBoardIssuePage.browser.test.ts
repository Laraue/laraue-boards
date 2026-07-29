import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { CreateBoardIssuePageDeps } from './CreateBoardIssuePage.deps'
import type { CreateBoardIssuePageData } from './CreateBoardIssuePage.types'
import CreateBoardIssuePage from './CreateBoardIssuePage.vue'

const pageData: CreateBoardIssuePageData = {
  attributes: [],
  boardName: 'Roadmap',
  spaceKey: 'product-AB12',
}

const createDeps = (
  overrides: Partial<CreateBoardIssuePageDeps> = {},
): CreateBoardIssuePageDeps => ({
  form: {
    assigneeSelect: {
      loadAssignees: vi.fn<CreateBoardIssuePageDeps['form']['assigneeSelect']['loadAssignees']>(),
    },
    boardSelect: {
      loadBoards: vi.fn<CreateBoardIssuePageDeps['form']['boardSelect']['loadBoards']>(),
    },
    create: vi.fn<CreateBoardIssuePageDeps['form']['create']>(),
    spaceSelect: {
      loadSpaces: vi.fn<CreateBoardIssuePageDeps['form']['spaceSelect']['loadSpaces']>(),
    },
    statusSelect: {
      loadStatuses: vi.fn<CreateBoardIssuePageDeps['form']['statusSelect']['loadStatuses']>(),
    },
  },
  view: vi.fn<CreateBoardIssuePageDeps['view']>(async () => ({
    data: pageData,
    status: 'success',
  })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: CreateBoardIssuePageDeps, onCreated: (issueKey: string) => void) => {
  currentWrapper = await mountSuspended(CreateBoardIssuePage, {
    attachTo: document.body,
    props: { boardId: '12', deps, onCreated, spaceKey: 'product-ABCD' },
    route: '/organizations/acme-ab12/spaces/product-ABCD/12/issues/new',
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows the board selected by the page', async () => {
  await mount(createDeps(), vi.fn<(issueKey: string) => void>())

  await expect.element(page.getByText('Roadmap')).toBeInTheDocument()
})
