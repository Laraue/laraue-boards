import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { IssueCommentsDeps } from './IssueComments.deps'
import type { IssueCommentViewModel } from './IssueComments.types'
import IssueComments from './IssueComments.vue'

const comments: IssueCommentViewModel[] = [
  {
    canModify: true,
    createdAt: '2026-01-01T00:00:00Z',
    id: '12',
    owner: { color: '#111', initials: 'A', name: 'Ada Lovelace' },
    text: 'Initial comment',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

const createDeps = (overrides: Partial<IssueCommentsDeps> = {}): IssueCommentsDeps => ({
  create: vi.fn<IssueCommentsDeps['create']>(async () => ({ data: true, status: 'success' })),
  delete: vi.fn<IssueCommentsDeps['delete']>(async () => ({ data: true, status: 'success' })),
  load: vi.fn<IssueCommentsDeps['load']>(async () => ({ data: comments, status: 'success' })),
  update: vi.fn<IssueCommentsDeps['update']>(async () => ({ data: true, status: 'success' })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
  vi.unstubAllGlobals()
})

const mount = async (deps = createDeps()) => {
  currentWrapper = await mountSuspended(IssueComments, {
    attachTo: document.body,
    props: { deps, initialComments: comments, issueKey: 'ISS-1' },
  })
  return currentWrapper
}

it('creates a comment', async () => {
  const create = vi.fn<IssueCommentsDeps['create']>(async () => ({ data: true, status: 'success' }))
  const load = vi.fn<IssueCommentsDeps['load']>(async () => ({ data: comments, status: 'success' }))
  await mount(createDeps({ create, load }))

  await expect.element(page.getByRole('button', { name: 'Add comment' })).not.toBeInTheDocument()
  await page.getByLabelText('Write a comment').fill('New comment')
  await expect.element(page.getByRole('button', { name: 'Add comment' })).toBeInTheDocument()
  await page.getByRole('button', { name: 'Add comment' }).click()

  expect(create).toHaveBeenCalledWith({ issueKey: 'ISS-1', text: 'New comment' })
  expect(load).toHaveBeenCalledWith({ issueKey: 'ISS-1' })
})

it('keeps the text and shows a validation error when creating a comment fails', async () => {
  const create = vi
    .fn<IssueCommentsDeps['create']>()
    .mockResolvedValue({ message: 'Comment is too long.', status: 'validation-error' })
  await mount(createDeps({ create }))

  await page.getByLabelText('Write a comment').fill('New comment')
  await page.getByRole('button', { name: 'Add comment' }).click()

  await expect.element(page.getByRole('alert')).toHaveTextContent('Comment is too long.')
  await expect.element(page.getByLabelText('Write a comment')).toHaveValue('New comment')
})

it('edits and deletes a comment', async () => {
  const update = vi.fn<IssueCommentsDeps['update']>(async () => ({ data: true, status: 'success' }))
  const remove = vi.fn<IssueCommentsDeps['delete']>(async () => ({ data: true, status: 'success' }))
  vi.stubGlobal('confirm', () => true)
  await mount(createDeps({ delete: remove, update }))

  await page.getByRole('button', { name: 'Edit' }).click()
  await page.getByLabelText('Edit comment by Ada Lovelace').fill('Updated')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()

  expect(update).toHaveBeenCalledWith({ id: '12', text: 'Updated' })
  expect(remove).toHaveBeenCalledWith({ id: '12' })
})
