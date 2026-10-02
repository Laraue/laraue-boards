import { assert, test, vi } from 'vitest'

import { ApiError } from '#infrastructure/api/request'
import { useApiAction } from '~/composables/useApiAction'
import { useToast } from '~/composables/useToast'

test('runs the action and reports success', async () => {
  const action = vi.fn<(value: string) => Promise<void>>(async () => {})
  const { execute, message, pending } = useApiAction(action)

  assert.isTrue(await execute('hi'))
  assert.isFalse(pending.value)
  assert.isUndefined(message.value)
  assert.deepEqual(action.mock.calls, [['hi']])
})

test('keeps the backend text of a failure for the form', async () => {
  const { execute, message } = useApiAction(async () => {
    throw new ApiError(400, 'Name is required.')
  })

  assert.isFalse(await execute())
  assert.equal(message.value, 'Name is required.')
})

test('shows other failures as a toast', async () => {
  const { toasts } = useToast()
  toasts.value = []
  const { execute, message } = useApiAction(async () => {
    throw new ApiError(500)
  })

  assert.isFalse(await execute())
  assert.isUndefined(message.value)
  assert.deepEqual(
    toasts.value.map((toast) => toast.message),
    ['Server error. Try again.'],
  )
})

test('lets errors that are not api errors through', async () => {
  const { execute } = useApiAction(async () => {
    throw new TypeError('bug')
  })

  let thrown: unknown
  await execute().catch((error: unknown) => (thrown = error))
  assert.instanceOf(thrown, TypeError)
})
