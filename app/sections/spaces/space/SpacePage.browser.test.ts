import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import { ApiError } from '#infrastructure/api/request'

import type { SpacePageData, SpacePageDeps } from './SpacePage.deps'
import SpacePage from './SpacePage.vue'

const pageData: SpacePageData = {
  about: { canEdit: true, description: null, links: [] },
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
      statuses: [{ category: 'Created', color: '#333', count: 3, name: 'To do' }],
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

it('shows what the space is about, and folds it away on request', async () => {
  const view = vi.fn<SpacePageDeps['view']>(async () => ({
    ...pageData,
    about: {
      canEdit: false,
      description: 'The **product** tracker.',
      links: [
        {
          description: 'Nuxt web app',
          id: '1',
          url: 'https://github.com/Laraue/laraue-boards',
        },
      ],
    },
  }))

  await mount(view)

  await expect.element(page.getByText('The product tracker.')).toBeInTheDocument()
  await expect
    .element(page.getByRole('link', { name: 'github.com/Laraue/laraue-boards' }))
    .toHaveAttribute('href', 'https://github.com/Laraue/laraue-boards')
  await expect.element(page.getByText('Nuxt web app')).toBeInTheDocument()

  await page.getByRole('button', { name: 'About this space' }).click()

  await expect.element(page.getByText('Nuxt web app')).not.toBeInTheDocument()
})

it('invites an editor to describe an empty space', async () => {
  await mount(vi.fn<SpacePageDeps['view']>(async () => pageData))

  await expect
    .element(page.getByRole('link', { name: /Describe this space/ }))
    .toHaveAttribute('href', '/organizations/acme-ab12/spaces/product/settings')
})
