import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { CreateIssuePageDeps } from './CreateIssuePage.deps'
import type { CreateIssuePageData } from './CreateIssuePage.types'
import CreateIssuePage from './CreateIssuePage.vue'

const pageData: CreateIssuePageData = { attributes: [] }

const createDeps = (overrides: Partial<CreateIssuePageDeps> = {}): CreateIssuePageDeps => ({
  form: {
    assigneeSelect: {
      loadAssignees: vi.fn<CreateIssuePageDeps['form']['assigneeSelect']['loadAssignees']>(
        async () => ({
          data: [
            {
              color: '#4774d4',
              initials: 'AL',
              isCurrentUser: false,
              label: 'Ann Lee',
              value: '9',
            },
          ],
          status: 'success',
        }),
      ),
    },
    boardSelect: {
      loadBoards: vi.fn<CreateIssuePageDeps['form']['boardSelect']['loadBoards']>(async () => ({
        data: [{ label: 'Sprint board', value: '12' }],
        status: 'success',
      })),
    },
    create: vi.fn<CreateIssuePageDeps['form']['create']>(),
    spaceSelect: {
      loadSpaces: vi.fn<CreateIssuePageDeps['form']['spaceSelect']['loadSpaces']>(async () => ({
        data: [{ label: 'Product', value: '7' }],
        status: 'success',
      })),
    },
    statusSelect: {
      loadStatuses: vi.fn<CreateIssuePageDeps['form']['statusSelect']['loadStatuses']>(
        async () => ({
          data: [{ label: 'To do', value: '1' }],
          status: 'success',
        }),
      ),
    },
  },
  view: vi.fn<CreateIssuePageDeps['view']>(async () => ({ data: pageData, status: 'success' })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: CreateIssuePageDeps, onCreated: (issueKey: string) => void) => {
  currentWrapper = await mountSuspended(CreateIssuePage, {
    attachTo: document.body,
    props: { deps, onCreated },
    route: '/organizations/acme-ab12/issues/new',
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('reloads the form data when the failed request is retried', async () => {
  const view = vi
    .fn<CreateIssuePageDeps['view']>()
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: pageData, status: 'success' })

  await mount(createDeps({ view }), vi.fn<(issueKey: string) => void>())

  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByRole('button', { name: 'Edit description' })).toBeInTheDocument()
})
