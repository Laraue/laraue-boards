import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import type { IssueCardAttribute } from './IssueCardAttributes.types'
import IssueCardAttributes from './IssueCardAttributes.vue'

const attributes: IssueCardAttribute[] = [
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
  currentWrapper = await mountSuspended(IssueCardAttributes, {
    attachTo: document.body,
    props: { attributes, max: 2 },
  })

  await expect.element(page.getByText('Bug')).toBeInTheDocument()
  await expect.element(page.getByText('High')).toBeInTheDocument()
  await expect.element(page.getByText('Acme')).not.toBeInTheDocument()
  await expect.element(page.getByText('+2')).toHaveAttribute('title', 'Client: Acme\nContext: Web')
})

it('shows every label without a limit', async () => {
  currentWrapper = await mountSuspended(IssueCardAttributes, {
    attachTo: document.body,
    props: { attributes },
  })

  await expect.element(page.getByText('Web')).toBeInTheDocument()
  await expect.element(page.getByText(/^\+\d/)).not.toBeInTheDocument()
})
