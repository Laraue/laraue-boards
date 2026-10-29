import { expect, test } from 'vitest'

import { actionFailure } from './actionFailure'

const errorMessage = (status: number) => `error ${status}`

test('keeps validation and backend explanations in the form', () => {
  expect(actionFailure(400, 'Name is required', errorMessage)).toEqual({
    message: 'Name is required',
    target: 'form',
  })
  expect(actionFailure(402, 'Insufficient funds', errorMessage)).toEqual({
    message: 'Insufficient funds',
    target: 'form',
  })
  expect(actionFailure(400, undefined, errorMessage)).toEqual({
    message: 'error 400',
    target: 'form',
  })
})

test('shows other failures as notifications with the text for their status', () => {
  expect(actionFailure(500, undefined, errorMessage)).toEqual({
    message: 'error 500',
    target: 'notification',
  })
})
