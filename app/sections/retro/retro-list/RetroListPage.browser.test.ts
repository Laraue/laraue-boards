import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { RetroListPageDeps } from './RetroListPage.deps'
import type { RetroListItemViewModel } from './RetroListPage.types'
import RetroListPage from './RetroListPage.vue'

const retros: RetroListItemViewModel[] = [
  {
    cardCount: 12,
    createdAt: '2026-08-20T10:00:00Z',
    finished: false,
    id: '7',
    name: 'Sprint 42',
    openActionCount: 0,
  },
  {
    cardCount: 8,
    createdAt: '2026-08-06T10:00:00Z',
    finished: true,
    id: '6',
    name: 'Sprint 41',
    openActionCount: 2,
  },
]

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const onUpdateQuery = vi.fn<(query: Record<string, unknown>) => void>()

const mount = async (
  deps: RetroListPageDeps,
  onOpen = vi.fn<(retroId: string) => void>(),
  routeQuery: Record<string, string> = {},
) => {
  currentWrapper = await mountSuspended(RetroListPage, {
    attachTo: document.body,
    props: { deps, onOpen, onUpdateQuery, routeQuery },
    route: '/organizations/acme-ab12/retro',
  })
  return onOpen
}

const listing = (data = retros, hasNextPage = false) =>
  vi.fn<RetroListPageDeps['view']>(async () => ({
    data: { hasNextPage, retros: data },
    status: 'success',
  }))

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

const successfulRemove = async () => ({ data: true as const, status: 'success' as const })

it('lists past retros with their state and links to each board', async () => {
  await mount({
    removeRetro: vi.fn<RetroListPageDeps['removeRetro']>(successfulRemove),
    startRetro: vi.fn<RetroListPageDeps['startRetro']>(),
    view: listing(),
  })

  await expect
    .element(page.getByRole('link', { name: /Sprint 42/ }))
    .toHaveAttribute('href', '/organizations/acme-ab12/retro/7')
  await expect.element(page.getByText('Active')).toBeInTheDocument()
  await expect.element(page.getByText('Finished')).toBeInTheDocument()
})

const startingDeps = (startRetro: RetroListPageDeps['startRetro'], data = retros) => ({
  removeRetro: vi.fn<RetroListPageDeps['removeRetro']>(successfulRemove),
  startRetro,
  view: listing(data),
})

const successfulStart = () =>
  vi.fn<RetroListPageDeps['startRetro']>(async () => ({
    data: { retroId: '9' },
    status: 'success',
  }))

it('deletes a retro after a confirmation', async () => {
  const removeRetro = vi.fn<RetroListPageDeps['removeRetro']>(successfulRemove)
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)

  await mount({ ...startingDeps(successfulStart()), removeRetro })
  await currentWrapper!.findAll('.retro-row-actions button')[0]!.trigger('click')

  expect(confirm).toHaveBeenCalledWith('Delete "Sprint 42" with all its notes and votes?')
  await vi.waitFor(() => expect(removeRetro).toHaveBeenCalledWith({ retroId: '7' }))
})

it('keeps the retro when the confirmation is declined', async () => {
  const removeRetro = vi.fn<RetroListPageDeps['removeRetro']>(successfulRemove)

  vi.spyOn(window, 'confirm').mockReturnValue(false)
  await mount({ ...startingDeps(successfulStart()), removeRetro })
  await currentWrapper!.findAll('.retro-row-actions button')[0]!.trigger('click')

  expect(removeRetro).not.toHaveBeenCalled()
})

it('opens the new board after starting a retro from scratch', async () => {
  const startRetro = successfulStart()
  const onOpen = await mount(startingDeps(startRetro, []))

  await page.getByRole('button', { name: 'Start retro' }).click()

  await vi.waitFor(() => expect(startRetro).toHaveBeenCalledOnce())
  // Nothing is carried over unless the team asks for it on a specific retro.
  expect(startRetro).toHaveBeenCalledWith({ basedOnRetroId: null, name: expect.any(String) })
  expect(onOpen).toHaveBeenCalledWith('9')
})

it('offers to continue only from a retro that still has open actions', async () => {
  await mount(startingDeps(successfulStart()))

  // Sprint 42 has nothing open, so continuing from it would carry nothing. The count lives in the
  // row itself - a number glued to the button read as something else entirely.
  expect(
    [...document.querySelectorAll('.retro-row-actions button')].map(
      (button) => button.getAttribute('aria-label') ?? button.textContent?.trim(),
    ),
  ).toEqual(['Delete retro', 'Continue', 'Delete retro'])
  expect(document.body.textContent).toContain('2 open actions')
})

it('carries the open actions of the retro the button belongs to', async () => {
  const startRetro = successfulStart()
  const onOpen = await mount(startingDeps(startRetro))

  await currentWrapper!.findAll('.retro-row-actions button')[1]!.trigger('click')

  await vi.waitFor(() => expect(startRetro).toHaveBeenCalledOnce())
  expect(startRetro).toHaveBeenCalledWith({ basedOnRetroId: '6', name: expect.any(String) })
  expect(onOpen).toHaveBeenCalledWith('9')
})

it('asks for the page the route points at and walks to the next one', async () => {
  const view = listing(retros, true)

  await mount({ ...startingDeps(successfulStart()), view }, undefined, { page: '2' })

  expect(view).toHaveBeenCalledWith({ page: 2, signal: expect.anything() })

  await page.getByRole('button', { name: 'Next page' }).click()

  expect(onUpdateQuery).toHaveBeenCalledWith({ page: '3' })
})
