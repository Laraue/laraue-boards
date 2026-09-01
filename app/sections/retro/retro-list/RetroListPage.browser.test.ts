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

const mount = async (deps: RetroListPageDeps, onOpen = vi.fn<(retroId: string) => void>()) => {
  currentWrapper = await mountSuspended(RetroListPage, {
    attachTo: document.body,
    props: { deps, onOpen },
    route: '/organizations/acme-ab12/retro',
  })
  return onOpen
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('lists past retros with their state and links to each board', async () => {
  await mount({
    startRetro: vi.fn<RetroListPageDeps['startRetro']>(),
    view: vi.fn<RetroListPageDeps['view']>(async () => ({ data: retros, status: 'success' })),
  })

  await expect
    .element(page.getByRole('link', { name: /Sprint 42/ }))
    .toHaveAttribute('href', '/organizations/acme-ab12/retro/7')
  await expect.element(page.getByText('Active')).toBeInTheDocument()
  await expect.element(page.getByText('Finished')).toBeInTheDocument()
})

const startingDeps = (startRetro: RetroListPageDeps['startRetro'], data = retros) => ({
  startRetro,
  view: vi.fn<RetroListPageDeps['view']>(async () => ({ data, status: 'success' })),
})

const successfulStart = () =>
  vi.fn<RetroListPageDeps['startRetro']>(async () => ({
    data: { retroId: '9' },
    status: 'success',
  }))

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

  // Sprint 42 has nothing open, so continuing from it would carry nothing.
  expect(
    [...document.querySelectorAll('.continue-btn')].map((button) => button.textContent?.trim()),
  ).toEqual(['Continue from here (2)'])
})

it('carries the open actions of the retro the button belongs to', async () => {
  const startRetro = successfulStart()
  const onOpen = await mount(startingDeps(startRetro))

  await currentWrapper!.find('.continue-btn').trigger('click')

  await vi.waitFor(() => expect(startRetro).toHaveBeenCalledOnce())
  expect(startRetro).toHaveBeenCalledWith({ basedOnRetroId: '6', name: expect.any(String) })
  expect(onOpen).toHaveBeenCalledWith('9')
})
