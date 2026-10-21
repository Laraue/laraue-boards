import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import { ApiError } from '#infrastructure/api/request'

import type { SpacePageData, SpacePageDeps } from './SpacePage.deps'
import SpacePage from './SpacePage.vue'

const pageData: SpacePageData = {
  about: { description: null, links: [] },
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
      createdAt: '2026-02-01T00:00:00Z',
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
    .element(page.getByRole('link', { name: 'Nuxt web app' }))
    .toHaveAttribute('href', 'https://github.com/Laraue/laraue-boards')

  await page.getByRole('button', { name: 'About this space' }).click()

  await expect.element(page.getByText('Nuxt web app')).not.toBeInTheDocument()
})

it('shows nothing about an empty space', async () => {
  await mount(vi.fn<SpacePageDeps['view']>(async () => pageData))

  await expect.element(page.getByRole('link', { name: 'Create board' })).toBeInTheDocument()
  await expect
    .element(page.getByRole('button', { name: 'About this space' }))
    .not.toBeInTheDocument()
})

const boardsData: SpacePageData = {
  ...pageData,
  boards: [
    ...pageData.boards,
    {
      color: '#444',
      createdAt: '2026-01-15T00:00:00Z',
      id: '10',
      issueCount: 1,
      kind: 'board',
      name: 'Archive',
      status: 'Done',
      statuses: [],
    },
    {
      color: '#555',
      createdAt: '2026-03-01T00:00:00Z',
      id: '11',
      issueCount: 0,
      kind: 'board',
      name: 'Launch',
      status: 'New',
      statuses: [],
    },
  ],
}

// The backlog row comes first; boards follow in the order they are shown.
const boardRow = (index: number) => page.getByRole('link', { name: /issues?$/ }).nth(index + 1)

it('lists the newest boards first, and sorts them by name or age on request', async () => {
  await mount(vi.fn<SpacePageDeps['view']>(async () => boardsData))

  await expect.element(boardRow(0)).toHaveTextContent('Launch')
  await expect.element(boardRow(2)).toHaveTextContent('Archive')

  await page.getByRole('combobox', { name: 'Sort by' }).click()
  await page.getByRole('option', { name: 'Name' }).click()

  await expect.element(boardRow(0)).toHaveTextContent('Archive')
  await expect.element(boardRow(1)).toHaveTextContent('Launch')
  await expect.element(boardRow(2)).toHaveTextContent('Roadmap')

  await page.getByRole('combobox', { name: 'Sort by' }).click()
  await page.getByRole('option', { name: 'Oldest first' }).click()

  await expect.element(boardRow(0)).toHaveTextContent('Archive')
  await expect.element(boardRow(2)).toHaveTextContent('Launch')
})

it('shows only the boards matching the quick filter', async () => {
  await mount(vi.fn<SpacePageDeps['view']>(async () => boardsData))

  await page.getByRole('combobox', { name: 'Show' }).click()
  await page.getByRole('option', { name: 'Not finished' }).click()

  await expect.element(page.getByRole('link', { name: /Archive/ })).not.toBeInTheDocument()
  await expect.element(page.getByRole('link', { name: /Roadmap/ })).toBeInTheDocument()
  await expect.element(page.getByRole('link', { name: /Launch/ })).toBeInTheDocument()

  await page.getByRole('combobox', { name: 'Show' }).click()
  await page.getByRole('option', { exact: true, name: 'Finished' }).click()

  await expect.element(page.getByRole('link', { name: /Archive/ })).toBeInTheDocument()
  await expect.element(page.getByRole('link', { name: /Roadmap/ })).not.toBeInTheDocument()
})

it('says no boards match when the filter hides them all', async () => {
  await mount(vi.fn<SpacePageDeps['view']>(async () => pageData))

  await page.getByRole('combobox', { name: 'Show' }).click()
  await page.getByRole('option', { exact: true, name: 'Finished' }).click()

  await expect.element(page.getByText('No boards match')).toBeInTheDocument()
  await expect.element(page.getByRole('link', { name: /Backlog/ })).toBeInTheDocument()
})
