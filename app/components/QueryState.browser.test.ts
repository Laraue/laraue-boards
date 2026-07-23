import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import QueryState from './QueryState.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

type QueryStateProps = {
  data?: { name: string }
  errorTitle?: string
  loadingText?: string
  message?: string
  onRetry?: () => void
  pending: boolean
}

const mount = async (props: QueryStateProps) => {
  currentWrapper = await mountSuspended(QueryState, {
    attachTo: document.body,
    props,
    slots: { default: '<p>Loaded {{ params.data.name }}</p>' },
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows the loading text while pending', async () => {
  await mount({ loadingText: 'Loading attributes…', pending: true })

  await expect.element(page.getByText('Loading attributes…')).toBeInTheDocument()
})

it('renders the slot with the loaded data', async () => {
  await mount({ data: { name: 'Priority' }, pending: false })

  await expect.element(page.getByText('Loaded Priority')).toBeInTheDocument()
})

it('shows the error title and message instead of the slot', async () => {
  await mount({
    errorTitle: 'Could not load attributes',
    message: 'You do not have permission to do this.',
    pending: false,
  })

  await expect.element(page.getByText('Could not load attributes')).toBeInTheDocument()
  await expect.element(page.getByText('You do not have permission to do this.')).toBeInTheDocument()
  await expect.element(page.getByText('Loaded Priority')).not.toBeInTheDocument()
})

it('calls onRetry when the retry button is pressed', async () => {
  const onRetry = vi.fn<() => void>()

  await mount({ message: 'Server error. Try again.', onRetry, pending: false })

  await page.getByRole('button', { name: 'Try again' }).click()

  expect(onRetry).toHaveBeenCalledTimes(1)
})

it('omits the retry button when no retry is provided', async () => {
  await mount({ message: 'Server error. Try again.', pending: false })

  await expect.element(page.getByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
})

it('prefers the loading state over an error left from a previous attempt', async () => {
  await mount({ message: 'Server error. Try again.', pending: true })

  await expect.element(page.getByText('Loading…')).toBeInTheDocument()
  await expect.element(page.getByText('Server error. Try again.')).not.toBeInTheDocument()
})
