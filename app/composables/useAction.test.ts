import { assert, test, vi } from 'vitest'

import type { ActionResult } from '#infrastructure/api/apiResult'
import { useAction } from '~/composables/useAction'
import { useToast } from '~/composables/useToast'

test('returns data and calls onSuccess on success', async () => {
  const onSuccess = vi.fn<(value: string) => void>()
  const { execute, message, pending } = useAction(
    async (value: string): Promise<ActionResult<string>> => ({
      data: `${value}!`,
      status: 'success',
    }),
    { onSuccess },
  )

  const result = await execute('hi')

  assert.equal(result, 'hi!')
  assert.equal(pending.value, false)
  assert.isUndefined(message.value)
  assert.deepEqual(onSuccess.mock.calls, [['hi!']])
})

test('tracks pending while the action runs', async () => {
  let resolve!: (result: ActionResult<string>) => void
  const { execute, pending } = useAction(
    () =>
      new Promise<ActionResult<string>>((r) => {
        resolve = r
      }),
  )

  const promise = execute()
  assert.equal(pending.value, true)

  resolve({ data: 'done', status: 'success' })
  await promise

  assert.equal(pending.value, false)
})

test('sets the validation message on a validation error', async () => {
  const { execute, message } = useAction(
    async (): Promise<ActionResult<string>> => ({
      message: 'Name is required.',
      status: 'validation-error',
    }),
  )

  const result = await execute()

  assert.isUndefined(result)
  assert.equal(message.value, 'Name is required.')
})

test('reports an opaque error as a toast instead of a form message', async () => {
  const { toasts } = useToast()
  toasts.value = []
  const { execute, message } = useAction(
    async (): Promise<ActionResult<string>> => ({ code: 500, status: 'error' }),
  )

  await execute()

  assert.isUndefined(message.value)
  assert.deepEqual(
    toasts.value.map((toast) => toast.message),
    ['Server error. Try again.'],
  )
})

test('clears a stale message when executed again', async () => {
  const action = vi
    .fn<() => Promise<ActionResult<string>>>()
    .mockResolvedValueOnce({ message: 'Name is required.', status: 'validation-error' })
    .mockResolvedValueOnce({ data: 'ok', status: 'success' })
  const { execute, message } = useAction(action)

  await execute()
  assert.equal(message.value, 'Name is required.')

  await execute()
  assert.isUndefined(message.value)
})
