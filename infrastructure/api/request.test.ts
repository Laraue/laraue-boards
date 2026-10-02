import { assert, expect, test } from 'vitest'

import { ApiError, isApiError, request } from '#infrastructure/api/request'

const response = (status: number) => new Response(null, { status })

test('returns the data of a successful response', async () => {
  const data = await request(Promise.resolve({ data: { raw: 'ok' }, response: response(200) }))

  assert.deepEqual(data, { raw: 'ok' })
})

test('throws the validation messages of a 400 response', async () => {
  const call = request(
    Promise.resolve({
      error: { errors: { Name: ['Name is required.'] } },
      response: response(400),
    }),
  )

  await expect(call).rejects.toMatchObject({ reason: 'Name is required.', status: 400 })
})

test('throws the reason of a 402 response', async () => {
  const call = request(
    Promise.resolve({
      error: { message: 'There are not enough AI credits to generate the title.' },
      response: response(402),
    }),
  )

  await expect(call).rejects.toMatchObject({
    reason: 'There are not enough AI credits to generate the title.',
    status: 402,
  })
})

test('throws the status of other errors', async () => {
  const call = request(Promise.resolve({ error: 'server error', response: response(500) }))

  await expect(call).rejects.toMatchObject({ reason: '', status: 500 })
})

test('throws status 0 when the request itself fails', async () => {
  const call = request(Promise.reject(new TypeError('network failed')))

  await expect(call).rejects.toMatchObject({ status: 0 })
})

test('lets an aborted request throw as is', async () => {
  const call = request(Promise.reject(new DOMException('aborted', 'AbortError')))

  await expect(call).rejects.toBeInstanceOf(DOMException)
})

test('matches an api error by status', () => {
  assert.isTrue(isApiError(new ApiError(404), 404))
  assert.isFalse(isApiError(new ApiError(500), 404))
  assert.isFalse(isApiError(new Error('boom')))
})
