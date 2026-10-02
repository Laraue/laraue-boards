import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import { ApiError } from '#infrastructure/api/request'

import type { SpacePageData, SpacePageDeps } from './SpacePage.deps'
import SpacePage from './SpacePage.vue'

const pageData: SpacePageData = {
  boards: [
    {
      color: '#111',
      id: '8',
      issueCount: 2,
      kind: 'backlog',
      name: 'Backlog',
      status: 'New',
      statuses: [],
    },
    {
      color: '#222',
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
  const view = vi.fn<SpacePageDeps['view']>(async () => pageData)

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
    ...pageData,
    canCreateBoards: false,
    canManage: false,
  }))

  await mount(view)

  await expect.element(page.getByRole('link', { name: 'Create board' })).not.toBeInTheDocument()
  await expect.element(page.getByRole('link', { name: 'Space settings' })).not.toBeInTheDocument()
})

it('reloads the space when the failed request is retried', async () => {
  const view = vi
    .fn<SpacePageDeps['view']>()
    .mockRejectedValueOnce(new ApiError(403))
    .mockResolvedValue(pageData)

  await mount(view)
  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByRole('heading', { name: 'Product' })).toBeInTheDocument()
})
