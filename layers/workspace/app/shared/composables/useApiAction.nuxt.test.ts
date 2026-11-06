import { assert, test, vi } from 'vitest'

import { ApiError } from '#infrastructure/api/request'
import { useToast } from '#layers/core/app/ui/composables/useToast'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'

test('resolves the value of a successful action', async () => {
  const action = vi.fn<(value: string) => Promise<string>>(async (value) => `${value}!`)
  const { execute, message, pending } = useApiAction(action)

  assert.deepEqual(await execute('hi'), { value: 'hi!' })
  assert.isFalse(pending.value)
  assert.isUndefined(message.value)
  assert.deepEqual(action.mock.calls, [['hi']])
})

test('resolves a success for an action without a value', async () => {
  const { execute } = useApiAction(async () => {})

  assert.deepEqual(await execute(), { value: undefined })
})

test('keeps the backend text of a failure for the form', async () => {
  const { execute, message } = useApiAction(async () => {
    throw new ApiError(400, 'Name is required.')
  })

  assert.isUndefined(await execute())
  assert.equal(message.value, 'Name is required.')
})

test('words a full storage itself instead of the backend text', async () => {
  const { execute, message } = useApiAction(async () => {
    throw new ApiError(402, 'English text from the backend', {
      quotaBytes: 104_857_600,
      requiredBytes: 2_097_152,
      usedBytes: 103_809_024,
    })
  })

  assert.isUndefined(await execute())
  assert.equal(
    message.value,
    'The organization’s storage is full: 99 MB of 100 MB used, and the files need 2 MB. Delete attachments, or get more storage on the billing page: upgrade the plan or add storage to it.',
  )
})

test('shows other failures as a toast', async () => {
  const { toasts } = useToast()
  toasts.value = []
  const { execute, message } = useApiAction(async () => {
    throw new ApiError(500)
  })

  assert.isUndefined(await execute())
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
