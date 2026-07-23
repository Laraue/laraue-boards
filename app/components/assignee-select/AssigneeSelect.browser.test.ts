import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { AssigneeSelectDeps } from './AssigneeSelect.deps'
import AssigneeSelect from './AssigneeSelect.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: AssigneeSelectDeps, spaceId = '7') => {
  currentWrapper = await mountSuspended(AssigneeSelect, {
    attachTo: document.body,
    props: { 'aria-label': 'Assignee', deps, modelValue: '', spaceId },
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('loads assignees when the user focuses the select', async () => {
  await mount({
    loadAssignees: vi.fn<AssigneeSelectDeps['loadAssignees']>(async () => ({
      data: [{ color: '#4774d4', initials: 'A', label: 'Ada Lovelace', value: '9' }],
      status: 'success',
    })),
  })

  await page.getByLabelText('Assignee').click()

  await expect.element(page.getByRole('option', { name: 'Ada Lovelace' })).toBeInTheDocument()
})

it('clears the selected assignee when the space changes', async () => {
  await mount(
    {
      loadAssignees: vi.fn<AssigneeSelectDeps['loadAssignees']>(async () => ({
        data: [{ color: '#4774d4', initials: 'A', label: 'Ada Lovelace', value: '9' }],
        status: 'success',
      })),
    },
    '7',
  )
  await page.getByLabelText('Assignee').click()
  await page.getByLabelText('Assignee').selectOptions('9')

  await currentWrapper!.setProps({ spaceId: '8' })

  await expect.element(page.getByLabelText('Assignee')).toHaveValue('')
})
