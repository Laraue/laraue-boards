import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { IssuePageDeps } from './IssuePage.deps'
import type { IssuePageViewModel } from './IssuePage.types'
import IssuePage from './IssuePage.vue'

const issue: IssuePageViewModel = {
  assignee: 'Ada Lovelace',
  assigneeColor: '#111',
  assigneeId: '9',
  assigneeInitial: 'A',
  attachments: [],
  attributes: [],
  boardId: '12',
  boardLabel: 'Sprint board',
  canEdit: true,
  content: 'Fix the bug',
  createdAt: '2026-01-01T00:00:00Z',
  issueKey: 'ISS-1',
  owner: 'Grace Hopper',
  ownerColor: '#222',
  ownerInitial: 'G',
  spaceId: '7',
  spaceLabel: 'Product',
  statusId: '3',
  statusLabel: 'To do',
  updatedAt: '2026-01-02T00:00:00Z',
}

const createDeps = (overrides: Partial<IssuePageDeps> = {}): IssuePageDeps => ({
  assigneeSelect: {
    loadAssignees: vi.fn<IssuePageDeps['assigneeSelect']['loadAssignees']>(async () => ({
      data: [{ color: '#111', initials: 'A', label: 'Ada Lovelace', value: '9' }],
      status: 'success',
    })),
  },
  boardSelect: {
    loadBoards: vi.fn<IssuePageDeps['boardSelect']['loadBoards']>(async () => ({
      data: [{ label: 'Sprint board', value: '12' }],
      status: 'success',
    })),
  },
  deleteIssue: vi.fn<IssuePageDeps['deleteIssue']>(async () => ({
    data: true,
    status: 'success',
  })),
  saveIssue: vi.fn<IssuePageDeps['saveIssue']>(),
  spaceSelect: {
    loadSpaces: vi.fn<IssuePageDeps['spaceSelect']['loadSpaces']>(async () => ({
      data: [{ label: 'Product', value: '7' }],
      status: 'success',
    })),
  },
  statusSelect: {
    loadStatuses: vi.fn<IssuePageDeps['statusSelect']['loadStatuses']>(async () => ({
      data: [{ label: 'To do', value: '3' }],
      status: 'success',
    })),
  },
  view: vi.fn<IssuePageDeps['view']>(async () => ({ data: issue, status: 'success' })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: IssuePageDeps, onBack: () => void = vi.fn<() => void>()) => {
  currentWrapper = await mountSuspended(IssuePage, {
    attachTo: document.body,
    props: { deps, issueKey: 'ISS-1', onBack },
    route: '/organizations/acme-ab12/issues/ISS-1',
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows the loaded issue', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => ({ data: issue, status: 'success' })),
    }),
  )

  await expect.element(page.getByRole('heading', { name: 'ISS-1' })).toBeInTheDocument()
})

it('leaves the page when back is pressed', async () => {
  const onBack = vi.fn<() => void>()

  await mount(createDeps(), onBack)

  await page.getByRole('button', { name: 'Back' }).click()

  expect(onBack).toHaveBeenCalledTimes(1)
})

it('leaves the page after the issue is saved', async () => {
  const onBack = vi.fn<() => void>()
  await mount(
    createDeps({
      saveIssue: vi.fn<IssuePageDeps['saveIssue']>(async () => ({
        data: {
          boardId: '12',
          complete: true,
          content: 'Document the reproduction steps',
          issueKey: 'ISS-1',
          previousBoardId: '12',
          previousStatusId: '3',
          statusId: '3',
        },
        status: 'success',
      })),
    }),
    onBack,
  )

  await page.getByLabelText('Content').fill('Document the reproduction steps')
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(onBack).toHaveBeenCalledOnce()
})

it('hides the actions when the issue cannot be edited', async () => {
  await mount(
    createDeps({
      view: vi.fn<IssuePageDeps['view']>(async () => ({
        data: { ...issue, canEdit: false },
        status: 'success',
      })),
    }),
  )

  await expect.element(page.getByRole('button', { name: 'Save changes' })).not.toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Delete issue' })).not.toBeInTheDocument()
})

it('reloads the issue when the failed request is retried', async () => {
  const view = vi
    .fn<IssuePageDeps['view']>()
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: issue, status: 'success' })

  await mount(createDeps({ view }))

  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByRole('heading', { name: 'ISS-1' })).toBeInTheDocument()
})
