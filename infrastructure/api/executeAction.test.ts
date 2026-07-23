import { assert, test } from 'vitest'

import { executeAction } from '#infrastructure/api/executeAction'

const response = (status: number) => new Response(null, { status })

test('maps a successful response to success', async () => {
  const result = await executeAction({
    map: (data: { raw: string }) => ({ mapped: data.raw }),
    request: async () => ({ data: { raw: 'ok' }, response: response(200) }),
  })

  assert.deepEqual(result, { data: { mapped: 'ok' }, status: 'success' })
})

test('treats a mapper returning undefined as an error', async () => {
  const result = await executeAction({
    map: () => undefined,
    request: async () => ({ data: {}, response: response(200) }),
  })

  assert.deepEqual(result, { code: 0, status: 'error' })
})

test('reads backend validation errors on a 400 response', async () => {
  const result = await executeAction({
    map: (data: unknown) => data,
    request: async () => ({
      error: { errors: { Name: ['Name is required.'] } },
      response: response(400),
    }),
  })

  assert.deepEqual(result, { message: 'Name is required.', status: 'validation-error' })
})

test('reports the response status for other errors', async () => {
  const result = await executeAction({
    map: (data: unknown) => data,
    request: async () => ({ error: 'server error', response: response(500) }),
  })

  assert.deepEqual(result, { code: 500, status: 'error' })
})

test('reports code 0 when the request throws', async () => {
  const result = await executeAction({
    map: (data: unknown) => data,
    request: async () => {
      throw new TypeError('network failed')
    },
  })

  assert.deepEqual(result, { code: 0, status: 'error' })
})
