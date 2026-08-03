import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import type { AssigneeSelectDeps } from './AssigneeSelect.deps'
import AssigneeSelect from './AssigneeSelect.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: AssigneeSelectDeps, spaceKey = 'product') => {
  currentWrapper = await mountSuspended(AssigneeSelect, {
    attachTo: document.body,
    props: { 'aria-label': 'Assignee', deps, modelValue: '', spaceKey },
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
  const loadAssignees = vi.fn<AssigneeSelectDeps['loadAssignees']>(async ({ spaceKey }) => ({
    data:
      spaceKey === 'backlog'
        ? [{ color: '#d44747', initials: 'G', label: 'Grace Hopper', value: '4' }]
        : [{ color: '#4774d4', initials: 'A', label: 'Ada Lovelace', value: '9' }],
    status: 'success',
  }))
  await mount({ loadAssignees }, '7')
  await page.getByLabelText('Assignee').click()
  await page.getByLabelText('Assignee').selectOptions('9')

  await userEvent.click(document.body)
  await currentWrapper!.setProps({ spaceKey: 'backlog' })

  expect(loadAssignees).toHaveBeenCalledOnce()
  await expect.element(page.getByLabelText('Assignee')).toHaveValue('')

  await page.getByLabelText('Assignee').click()

  await expect.element(page.getByRole('option', { name: 'Grace Hopper' })).toBeInTheDocument()
})
