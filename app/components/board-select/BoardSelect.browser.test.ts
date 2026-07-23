import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { BoardSelectDeps } from './BoardSelect.deps'
import BoardSelect from './BoardSelect.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: BoardSelectDeps, props: Record<string, unknown> = {}) => {
  currentWrapper = await mountSuspended(BoardSelect, {
    attachTo: document.body,
    props: { 'aria-label': 'Board', deps, modelValue: '', spaceId: '7', ...props },
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('loads boards when the user focuses the select', async () => {
  await mount({
    loadBoards: vi.fn<BoardSelectDeps['loadBoards']>(async () => ({
      data: [{ label: 'Sprint board', value: '12' }],
      status: 'success',
    })),
  })

  await page.getByLabelText('Board').click()

  await expect.element(page.getByRole('option', { name: 'Sprint board' })).toBeInTheDocument()
})

it('hides the excluded board from the destination choices', async () => {
  await mount(
    {
      loadBoards: vi.fn<BoardSelectDeps['loadBoards']>(async () => ({
        data: [
          { label: 'Current board', value: '12' },
          { label: 'Sprint board', value: '13' },
        ],
        status: 'success',
      })),
    },
    { excludedValue: '12' },
  )

  await page.getByLabelText('Board').click()

  await expect.element(page.getByRole('option', { name: 'Current board' })).not.toBeInTheDocument()
  await expect.element(page.getByRole('option', { name: 'Sprint board' })).toBeInTheDocument()
})
