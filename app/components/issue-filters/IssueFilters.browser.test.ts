import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import IssueFilters from './IssueFilters.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async () => {
  currentWrapper = await mountSuspended(IssueFilters, {
    attachTo: document.body,
    props: {
      attributes: [
        {
          color: '#4774d4',
          id: 'priority',
          name: 'Priority',
          options: [{ label: 'High', value: 'high' }],
          type: 'list',
        },
      ],
      loading: false,
      modelValue: { attributes: {}, spaceIds: [] },
      spaces: [{ label: 'Product', value: '7' }],
    },
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('updates the filters when the user selects a space', async () => {
  await mount()

  await page.getByRole('button', { name: 'Filters' }).click()
  await page.getByLabelText('Product').click()

  expect(currentWrapper!.emitted('update:modelValue')).toEqual([
    [{ attributes: {}, spaceIds: ['7'] }],
  ])
})

it('clears all selected filters', async () => {
  await mount()
  await currentWrapper!.setProps({
    modelValue: { attributes: { priority: ['high'] }, spaceIds: ['7'] },
  })

  await page.getByRole('button', { name: /Filters/ }).click()
  await page.getByRole('button', { name: 'Clear all' }).click()

  expect(currentWrapper!.emitted('update:modelValue')).toEqual([[{ attributes: {}, spaceIds: [] }]])
})
