import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type {
  CreateBoardIssuePageData,
  CreateBoardIssuePageDeps,
} from './CreateBoardIssuePage.deps'
import CreateBoardIssuePage from './CreateBoardIssuePage.vue'

const pageData: CreateBoardIssuePageData = {
  attributes: [],
  boardName: 'Roadmap',
  spaceName: 'Product',
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
    description: {
      summarizeContent:
        vi.fn<CreateBoardIssuePageDeps['form']['description']['summarizeContent']>(),
    },
    spaceSelect: {
      loadSpaces: vi.fn<CreateBoardIssuePageDeps['form']['spaceSelect']['loadSpaces']>(),
    },
    statusSelect: {
      loadStatuses: vi.fn<CreateBoardIssuePageDeps['form']['statusSelect']['loadStatuses']>(),
    },
  },
  view: vi.fn<CreateBoardIssuePageDeps['view']>(async () => pageData),
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

  // The header's path links to the board, the form shows it as the issue's board.
  await expect.element(page.getByRole('link', { name: 'Roadmap' })).toBeInTheDocument()
  await expect.element(page.getByText('Roadmap', { exact: true }).last()).toBeInTheDocument()
})
