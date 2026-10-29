import { expect, test } from 'vitest'

import { createConfirmation } from './createConfirmation'

test('each owner has an independent pending confirmation', async () => {
  const first = createConfirmation(),
    second = createConfirmation()
  const a = first.ask({ title: 'First?' }),
    b = second.ask({ title: 'Second?' })
  first.answer(true)
  expect(await a).toBe(true)
  expect(second.pending.value?.title).toBe('Second?')
  second.answer(false)
  expect(await b).toBe(false)
})

test('a new request declines the previous one', async () => {
  const service = createConfirmation()
  const previous = service.ask({ title: 'Old?' })
  const next = service.ask({ title: 'New?' })
  expect(await previous).toBe(false)
  service.answer(true)
  expect(await next).toBe(true)
  expect(service.pending.value).toBeNull()
})
