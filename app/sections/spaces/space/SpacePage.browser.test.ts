import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { SpacePageDeps } from './SpacePage.deps'
import type { SpaceBoardSummary, SpacePageData } from './SpacePage.types'
import SpacePage from './SpacePage.vue'

const pageData: SpacePageData = {
  boards: [
    {
      color: '#111',
      createdAt: '2026-01-01T00:00:00Z',
      id: '8',
      issueCount: 2,
      kind: 'backlog',
      name: 'Backlog',
      status: 'New',
      statuses: [],
    },
    {
      color: '#222',
      createdAt: '2026-01-01T00:00:00Z',
      id: '9',
      issueCount: 3,
      kind: 'board',
      name: 'Roadmap',
      status: 'Active',
      statuses: [{ color: '#333', count: 3, name: 'To do' }],
    },
  ],
  canCreateBoards: true,
  canManage: true,
  color: '#4774d4',
  id: '4',
  key: 'product',
  name: 'Product',
}

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (view: SpacePageDeps['view']) => {
  currentWrapper = await mountSuspended(SpacePage, {
    attachTo: document.body,
    props: { deps: { view }, spaceKey: 'product' },
    route: '/organizations/acme-ab12/spaces/product',
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows the space and links to its backlog, board, creation, and settings pages', async () => {
  const view = vi.fn<SpacePageDeps['view']>(async () => ({
    data: pageData,
    status: 'success',
  }))

  await mount(view)

  await expect
    .element(page.getByRole('link', { name: /Backlog/ }))
    .toHaveAttribute('href', '/organizations/acme-ab12/spaces/product/backlog')
  await expect
    .element(page.getByRole('link', { name: /Roadmap/ }))
    .toHaveAttribute('href', '/organizations/acme-ab12/spaces/product/9')
  await expect.element(page.getByRole('link', { name: 'Create board' })).toBeInTheDocument()
  await expect.element(page.getByRole('link', { name: 'Space settings' })).toBeInTheDocument()
})

it('hides management actions when the member lacks permission', async () => {
  const view = vi.fn<SpacePageDeps['view']>(async () => ({
    data: { ...pageData, canCreateBoards: false, canManage: false },
    status: 'success',
  }))

  await mount(view)

  await expect.element(page.getByRole('link', { name: 'Create board' })).not.toBeInTheDocument()
  await expect.element(page.getByRole('link', { name: 'Space settings' })).not.toBeInTheDocument()
})

it('reloads the space when the failed request is retried', async () => {
  const view = vi
    .fn<SpacePageDeps['view']>()
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: pageData, status: 'success' })

  await mount(view)
  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByRole('heading', { name: 'Product' })).toBeInTheDocument()
})

const board = (id: string, name: string, createdAt: string): SpaceBoardSummary => ({
  color: '#222',
  createdAt,
  id,
  issueCount: 0,
  kind: 'board',
  name,
  status: 'New',
  statuses: [],
})

it('shows the newest boards first', async () => {
  const view = vi.fn<SpacePageDeps['view']>(async () => ({
    data: {
      ...pageData,
      boards: [
        board('1', 'Sprint 1', '2026-01-01T00:00:00Z'),
        board('3', 'Sprint 3', '2026-03-01T00:00:00Z'),
        board('2', 'Sprint 2', '2026-02-01T00:00:00Z'),
      ],
    },
    status: 'success',
  }))

  await mount(view)

  await expect.element(page.getByText('Sprint 3')).toBeVisible()
  const names = [...document.querySelectorAll('.board-summary strong')].map(
    (item) => item.textContent,
  )
  expect(names).toEqual(['Sprint 3', 'Sprint 2', 'Sprint 1'])
})
