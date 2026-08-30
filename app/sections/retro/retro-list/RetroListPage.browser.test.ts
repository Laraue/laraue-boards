import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { RetroListPageDeps } from './RetroListPage.deps'
import type { RetroListItemViewModel } from './RetroListPage.types'
import RetroListPage from './RetroListPage.vue'

const retros: RetroListItemViewModel[] = [
  { cardCount: 12, createdAt: '2026-08-20T10:00:00Z', finished: false, id: '7', name: 'Sprint 42' },
  { cardCount: 8, createdAt: '2026-08-06T10:00:00Z', finished: true, id: '6', name: 'Sprint 41' },
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

it('opens the new board after starting a retro', async () => {
  const startRetro = vi.fn<RetroListPageDeps['startRetro']>(async () => ({
    data: { retroId: '9' },
    status: 'success',
  }))
  const onOpen = await mount({
    startRetro,
    view: vi.fn<RetroListPageDeps['view']>(async () => ({ data: [], status: 'success' })),
  })

  await page.getByRole('button', { name: 'Start retro' }).click()

  await vi.waitFor(() => expect(startRetro).toHaveBeenCalledOnce())
  expect(onOpen).toHaveBeenCalledWith('9')
})
