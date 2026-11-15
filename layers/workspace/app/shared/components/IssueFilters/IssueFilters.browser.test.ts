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
        { color: '#489c61', id: 'estimate', name: 'Estimate', type: 'integer' },
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
  await page.getByRole('button', { exact: true, name: 'Space' }).click()
  await page.getByLabelText('Product').click()

  expect(currentWrapper!.emitted('update:modelValue')).toEqual([
    [{ attributes: {}, spaceIds: ['7'] }],
  ])
})

it('updates a list filter', async () => {
  await mount()

  await page.getByRole('button', { name: 'Filters' }).click()
  await page.getByRole('button', { name: 'Priority' }).click()
  await page.getByLabelText('High').click()

  expect(currentWrapper!.emitted('update:modelValue')).toEqual([
    [{ attributes: { priority: ['high'] }, spaceIds: [] }],
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

it('updates a numeric range filter', async () => {
  await mount()

  await page.getByRole('button', { name: 'Filters' }).click()
  await page.getByRole('button', { name: 'Estimate' }).click()
  await page.getByLabelText('Maximum').fill('10')

  expect(currentWrapper!.emitted('update:modelValue')).toEqual([
    [{ attributes: { estimate: ['', '10'] }, spaceIds: [] }],
  ])
})

const trigger = () => page.getByRole('button', { name: /^Filters/ }).element()

it('selects the current user, preserves other filters and clears assignees', async () => {
  await mount()
  const id = '00000000-0000-0000-0000-000000000001'
  await currentWrapper!.setProps({
    assigneeSelect: {
      loadAssignees: async () => [{
        color: '#db2777',
        initials: 'GR',
        isCurrentUser: false,
        label: 'Grace',
        value: '00000000-0000-0000-0000-000000000002',
      }, {
        color: '#4774d4',
        initials: 'AD',
        isCurrentUser: true,
        label: 'Ada',
        value: id,
      }],
    },
    modelValue: { attributes: {}, spaceIds: ['7'] },
  })
  await page.getByRole('button', { name: /^Filters/ }).click()
  await page.getByRole('button', { exact: true, name: 'Assignees' }).click()
  await expect.element(page.getByRole('checkbox', { name: 'Ada (me)' })).toBeInTheDocument()
  const labels = [...document.querySelectorAll('.assignee-option > span:last-child')].map((el) => el.textContent?.replace(/\s+/g, ' ').trim())
  expect(labels).toEqual(['Ada (me)', 'Grace'])
  expect(document.querySelectorAll('.assignee-option .base-avatar')).toHaveLength(2)
  await page.getByRole('checkbox', { name: 'Ada (me)' }).click()
  expect(currentWrapper!.emitted('update:modelValue')?.at(-1)).toEqual([
    { assigneeIds: [id], attributes: {}, spaceIds: ['7'] },
  ])
  await currentWrapper!.setProps({
    modelValue: { assigneeIds: [id], attributes: {}, spaceIds: ['7'] },
  })
  expect(trigger().getAttribute('aria-label')).toBe('Filters (2)')
  await expect.element(page.getByRole('checkbox', { name: 'Ada (me)' })).toBeChecked()
  await page.getByRole('checkbox', { name: 'Ada (me)' }).click()
  expect(currentWrapper!.emitted('update:modelValue')?.at(-1)).toEqual([
    { assigneeIds: [], attributes: {}, spaceIds: ['7'] },
  ])
  await page.getByRole('button', { name: 'Clear all' }).click()
  expect(currentWrapper!.emitted('update:modelValue')?.at(-1)).toEqual([
    { assigneeIds: [], attributes: {}, spaceIds: [] },
  ])
})

it('highlights the trigger when only board statuses are selected and clears it on reset', async () => {
  await mount()
  const originalColor = getComputedStyle(trigger()).color
  const originalBackground = getComputedStyle(trigger()).backgroundColor
  await currentWrapper!.setProps({
    epicStatuses: [
      { label: 'New', value: 'New' },
      { label: 'In progress', value: 'Active' },
    ],
    modelValue: { attributes: {}, epicStatuses: ['New', 'Active'], spaceIds: [] },
  })

  expect(trigger().getAttribute('aria-label')).toBe('Filters (2)')
  expect(getComputedStyle(trigger()).color).not.toBe(originalColor)
  expect(getComputedStyle(trigger()).backgroundColor).not.toBe(originalBackground)
  await currentWrapper!.setProps({
    modelValue: { attributes: {}, epicStatuses: [], spaceIds: [] },
  })
  expect(getComputedStyle(trigger()).color).toBe(originalColor)
  expect(getComputedStyle(trigger()).backgroundColor).toBe(originalBackground)
})
