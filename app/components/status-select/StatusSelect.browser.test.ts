import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { StatusSelectDeps } from './StatusSelect.deps'
import StatusSelect from './StatusSelect.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: StatusSelectDeps, boardId = '12') => {
  currentWrapper = await mountSuspended(StatusSelect, {
    attachTo: document.body,
    props: { 'aria-label': 'Status', boardId, deps, modelValue: '' },
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

it('clears the selected status when the board changes', async () => {
  const loadStatuses = vi.fn<StatusSelectDeps['loadStatuses']>(async () => ({
    data: [{ label: 'To do', value: '3' }],
    status: 'success',
  }))
  await mount({ loadStatuses })
  await page.getByLabelText('Status').click()
  await page.getByLabelText('Status').selectOptions('3')

  await currentWrapper!.setProps({ boardId: '13' })

  expect(loadStatuses).toHaveBeenCalledOnce()
  await expect.element(page.getByLabelText('Status')).toHaveValue('')
})
