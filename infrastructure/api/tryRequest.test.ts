import { assert, expect, test } from 'vitest'

import { isErrorResponse, tryRequest, type ApiResponse } from '#infrastructure/api/tryRequest'

test('turns a thrown request into an empty response', async () => {
  assert.equal(await tryRequest(async () => 'ok'), 'ok')
  assert.isUndefined(
    await tryRequest(async () => {
      throw new TypeError('network failed')
    }),
  )
})

test('preserves request cancellation', async () => {
  await expect(
    tryRequest(async () => {
      throw new DOMException('aborted', 'AbortError')
    }),
  ).rejects.toMatchObject({ name: 'AbortError' })
})

const responseOf = (status: number, error?: unknown) =>
  ({ error, response: new Response(null, { status }) }) as ApiResponse<unknown>

test('treats a failed response without a body as an error', () => {
  assert.isTrue(isErrorResponse(responseOf(401)))
  assert.isTrue(isErrorResponse(responseOf(400, 'bad')))
  assert.isFalse(isErrorResponse(responseOf(204)))
  assert.isFalse(isErrorResponse(undefined))
})
