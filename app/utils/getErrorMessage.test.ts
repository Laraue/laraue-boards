import { assert, test } from 'vitest'

import { getErrorMessage } from '~/utils/getErrorMessage'

test('maps known status codes to their message', () => {
  assert.equal(getErrorMessage(401), 'Sign in to continue.')
  assert.equal(getErrorMessage(403), 'You do not have permission to do this.')
  assert.equal(getErrorMessage(404), 'Not found.')
  assert.equal(getErrorMessage(409), 'This conflicts with existing data.')
  assert.equal(getErrorMessage(429), 'Too many requests. Try again shortly.')
  assert.equal(getErrorMessage(500), 'Server error. Try again.')
})

test('falls back to a generic message for an unknown code', () => {
  assert.equal(getErrorMessage(418), 'Could not complete the request.')
  assert.equal(getErrorMessage(0), 'Could not complete the request.')
})
