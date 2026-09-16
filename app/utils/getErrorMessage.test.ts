import { assert, test } from 'vitest'

import { getErrorMessage } from '~/utils/getErrorMessage'

test('maps known status codes to their message', () => {
  assert.equal(getErrorMessage(401, 'en'), 'Sign in to continue.')
  assert.equal(getErrorMessage(403, 'en'), 'You do not have permission to do this.')
  assert.equal(getErrorMessage(404, 'en'), 'Not found.')
  assert.equal(getErrorMessage(409, 'en'), 'This conflicts with existing data.')
  assert.equal(getErrorMessage(429, 'en'), 'Too many requests. Try again shortly.')
  assert.equal(getErrorMessage(500, 'en'), 'Server error. Try again.')
  assert.equal(getErrorMessage(503, 'en'), 'Server error. Try again.')
  assert.equal(getErrorMessage(413, 'en'), 'The file is too large.')
  assert.equal(getErrorMessage(0, 'en'), 'Could not reach the server. Check your connection.')
})

test('falls back to a generic message for an unknown code', () => {
  assert.equal(getErrorMessage(418, 'en'), 'Could not complete the request.')
  assert.equal(getErrorMessage(418, 'ru'), 'Не удалось выполнить запрос.')
})
