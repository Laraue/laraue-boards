import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import type { StatusSelectDeps } from './StatusSelect.deps'
import StatusSelect from './StatusSelect.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  deps: StatusSelectDeps,
  boardId = '12',
  props: { eager?: boolean; modelValue?: string; selectFirst?: boolean } = {},
) => {
  currentWrapper = await mountSuspended(StatusSelect, {
    attachTo: document.body,
    props: { 'aria-label': 'Status', boardId, deps, modelValue: '', ...props },
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('loads statuses when the user focuses the select', async () => {
  await mount({
    loadStatuses: vi.fn<StatusSelectDeps['loadStatuses']>(async () => ({
      data: [{ label: 'To do', value: '3' }],
      status: 'success',
    })),
  })

  await page.getByLabelText('Status').click()

  await expect.element(page.getByRole('option', { name: 'To do' })).toBeInTheDocument()
})

it('selects the first status when the initial status is unavailable', async () => {
  await mount(
    {
      loadStatuses: vi.fn<StatusSelectDeps['loadStatuses']>(async () => ({
        data: [
          { label: 'To do', value: '3' },
          { label: 'Done', value: '5' },
        ],
        status: 'success',
      })),
    },
    '12',
    { eager: true, modelValue: '999', selectFirst: true },
  )

  await expect.element(page.getByLabelText('Status')).toHaveValue('3')
})

it('clears the selected status when the board changes', async () => {
  const loadStatuses = vi.fn<StatusSelectDeps['loadStatuses']>(async ({ boardId }) => ({
    data: boardId === '13' ? [{ label: 'Done', value: '5' }] : [{ label: 'To do', value: '3' }],
    status: 'success',
  }))
  await mount({ loadStatuses })
  await page.getByLabelText('Status').click()
  await page.getByLabelText('Status').selectOptions('3')

  await userEvent.click(document.body)
  await currentWrapper!.setProps({ boardId: '13' })

  expect(loadStatuses).toHaveBeenCalledOnce()
  await expect.element(page.getByLabelText('Status')).toHaveValue('')

  await page.getByLabelText('Status').click()

  await expect.element(page.getByRole('option', { name: 'Done' })).toBeInTheDocument()
})
