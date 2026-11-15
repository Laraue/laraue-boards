import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import type { IssueAttributeLabel } from './IssueAttributeLabels.types'
import IssueAttributeLabels from './IssueAttributeLabels.vue'

const attributes: IssueAttributeLabel[] = [
  { color: '#111', kind: 'text', name: 'Type', value: 'Bug' },
  { color: '#222', kind: 'text', name: 'Priority', value: 'High' },
  { color: '#333', kind: 'text', name: 'Client', value: 'Acme' },
  { color: '#444', kind: 'text', name: 'Context', value: 'Web' },
]

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('collapses the labels past the limit into one that lists them', async () => {
  currentWrapper = await mountSuspended(IssueAttributeLabels, {
    attachTo: document.body,
    props: { attributes, max: 2 },
  })

  await expect.element(page.getByText('Bug')).toBeInTheDocument()
  await expect.element(page.getByText('High')).toBeInTheDocument()
  await expect.element(page.getByText('Acme')).not.toBeInTheDocument()
  expect(currentWrapper.get('.attribute-label-more').attributes('aria-label')).toBe(
    'Client: Acme, Context: Web',
  )
})

it('shows every label without a limit', async () => {
  currentWrapper = await mountSuspended(IssueAttributeLabels, {
    attachTo: document.body,
    props: { attributes },
  })

  await expect.element(page.getByText('Web')).toBeInTheDocument()
  await expect.element(page.getByText(/\+\d/)).not.toBeInTheDocument()
})

it('summarizes attributes and opens every named value on click or keyboard', async () => {
  currentWrapper = await mountSuspended(IssueAttributeLabels, {
    attachTo: document.body,
    props: { attributes, collapsed: true },
  })

  const trigger = page.getByRole('button', { exact: true, name: 'Attributes' })
  await trigger.hover()
  await expect.element(page.getByText('Bug', { exact: true })).not.toBeInTheDocument()
  await trigger.click()
  await expect.element(page.getByRole('dialog').getByText('Type', { exact: true })).toBeVisible()
  expect(currentWrapper.get('.attribute-details .attribute-label').text()).toBe('Bug')
  expect(currentWrapper.find('.attribute-details .attribute-label svg').exists()).toBe(true)
  await expect.element(page.getByRole('dialog').getByText('Acme', { exact: true })).toBeVisible()
  await page.getByRole('dialog').getByText('Acme', { exact: true }).click()
  await userEvent.keyboard('{Escape}')
  await expect.element(trigger).toHaveFocus()
  await userEvent.keyboard('{Enter}')
  await expect.element(page.getByRole('dialog').getByText('Web', { exact: true })).toBeVisible()
  await userEvent.keyboard('{Escape}')
  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
})
