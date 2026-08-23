import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import IssueAttributeFields from './IssueAttributeFields.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (modelValue: Record<string, string> = {}) => {
  currentWrapper = await mountSuspended(IssueAttributeFields, {
    attachTo: document.body,
    props: {
      attributes: [
        { color: '#4774d4', id: 'summary', name: 'Summary', type: 'text' },
        {
          color: '#d65f63',
          id: 'priority',
          name: 'Priority',
          options: [{ label: 'High', value: 'high' }],
          type: 'list',
        },
        { color: '#489c61', id: 'estimate', name: 'Estimate', type: 'integer' },
        { color: '#8a5fc1', id: 'starts', name: 'Starts', type: 'dateTime' },
      ],
      modelValue,
    },
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('returns the text value entered by the user', async () => {
  await mount()

  await page.getByLabelText('Summary').fill('Investigate the outage')

  expect(currentWrapper!.emitted('update:modelValue')).toEqual([
    [{ summary: 'Investigate the outage' }],
  ])
})

it('returns the selected list value', async () => {
  await mount()

  await page.getByLabelText('Priority').selectOptions('high')

  expect(currentWrapper!.emitted('update:modelValue')).toEqual([[{ priority: 'high' }]])
})

it('shows the current list value', async () => {
  await mount({ priority: 'high' })

  await expect.element(page.getByLabelText('Priority')).toHaveValue('high')
})

it('uses native controls for integer and date-time values', async () => {
  await mount()

  await expect.element(page.getByLabelText('Estimate')).toHaveAttribute('type', 'number')
  await expect.element(page.getByLabelText('Starts')).toHaveAttribute('type', 'datetime-local')
})
