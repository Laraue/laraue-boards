import { assert, test } from 'vitest'

import { executeQuery } from '#infrastructure/api/executeQuery'

const response = (status: number) => new Response(null, { status })

test('maps a successful response to success', async () => {
  const result = await executeQuery({
    map: (data: { raw: string }) => ({ mapped: data.raw }),
    request: async () => ({ data: { raw: 'ok' }, response: response(200) }),
  })

  assert.deepEqual(result, { data: { mapped: 'ok' }, status: 'success' })
})

test('treats a mapper returning undefined on a successful response as not found', async () => {
  const result = await executeQuery({
    map: () => undefined,
    request: async () => ({ data: {}, response: response(200) }),
  })

  assert.deepEqual(result, { code: 404, status: 'error' })
})

test('reports the response status for a failed request', async () => {
  const result = await executeQuery({
    map: (data: unknown) => data,
    request: async () => ({ error: 'server error', response: response(404) }),
  })

  assert.deepEqual(result, { code: 404, status: 'error' })
})

test('reports code 0 when the request throws', async () => {
  const result = await executeQuery({
    map: (data: unknown) => data,
    request: async () => {
      throw new TypeError('network failed')
    },
  })

  assert.deepEqual(result, { code: 0, status: 'error' })
})
