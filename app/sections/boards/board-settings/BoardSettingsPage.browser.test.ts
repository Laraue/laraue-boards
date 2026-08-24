import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import type { BoardSettingsPageDeps } from './BoardSettingsPage.deps'
import type { BoardSettingsPageData } from './BoardSettingsPage.types'
import BoardSettingsPage from './BoardSettingsPage.vue'

const board: BoardSettingsPageData = {
  canDelete: true,
  canUpdate: true,
  color: '#4774d4',
  columns: [
    { color: '#4774d4', id: '1', name: 'To do' },
    { color: '#d65f63', id: '2', name: 'Done' },
  ],
  name: 'Roadmap',
  status: 'New',
}

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: BoardSettingsPageDeps, onSaved: () => void) => {
  currentWrapper = await mountSuspended(BoardSettingsPage, {
    attachTo: document.body,
    props: {
      boardId: '12',
      deps,
      onDeleted: vi.fn<() => void>(),
      onSaved,
      spaceKey: 'product-AB12',
    },
    route: '/organizations/acme-ab12/spaces/product-AB12/12/settings',
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('saves the board name edited by the user', async () => {
  const save = vi.fn<BoardSettingsPageDeps['save']>(async () => ({ data: true, status: 'success' }))
  const onSaved = vi.fn<() => void>()

  await mount(
    {
      remove: vi.fn<BoardSettingsPageDeps['remove']>(),
      save,
      view: vi.fn<BoardSettingsPageDeps['view']>(async () => ({ data: board, status: 'success' })),
    },
    onSaved,
  )
  await page.getByLabelText('Name').fill('Planning')
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(save).toHaveBeenCalledWith({
    boardId: '12',
    color: '#4774d4',
    columns: board.columns,
    name: 'Planning',
    originalColumns: board.columns,
    originalStatus: 'New',
    status: 'New',
  })
  expect(onSaved).toHaveBeenCalledOnce()
})

it('reorders columns through keyboard drag and drop before saving', async () => {
  const save = vi.fn<BoardSettingsPageDeps['save']>(async () => ({ data: true, status: 'success' }))

  await mount(
    {
      remove: vi.fn<BoardSettingsPageDeps['remove']>(),
      save,
      view: vi.fn<BoardSettingsPageDeps['view']>(async () => ({ data: board, status: 'success' })),
    },
    vi.fn<() => void>(),
  )
  const handle = page.getByRole('button', { name: 'Reorder column' }).first()

  await handle.click()
  await userEvent.keyboard('{Space}{ArrowDown}{Space}')
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(save).toHaveBeenCalledWith(
    expect.objectContaining({
      columns: [
        { color: '#d65f63', id: '2', name: 'Done' },
        { color: '#4774d4', id: '1', name: 'To do' },
      ],
    }),
  )
})
