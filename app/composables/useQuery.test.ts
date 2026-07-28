import { assert, test } from 'vitest'

import type { QueryResult } from '#infrastructure/api/apiResult'
import { useQuery } from '~/composables/useQuery'

test('exposes mapped data on success', async () => {
  const { data, message, pending } = await useQuery(
    'useQuery-test-success',
    async (): Promise<QueryResult<string>> => ({ data: 'hello', status: 'success' }),
  )

  assert.equal(data.value, 'hello')
  assert.isUndefined(message.value)
  assert.equal(pending.value, false)
})

test('exposes the error message on failure', async () => {
  const { data, message } = await useQuery(
    'useQuery-test-error',
    async (): Promise<QueryResult<string>> => ({ code: 404, status: 'error' }),
  )

  assert.isUndefined(data.value)
  assert.equal(message.value, 'Not found.')
})
